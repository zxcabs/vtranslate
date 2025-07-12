import savedAsync from "../utils/savedAsync.mjs";

const YD_URL_PREFIX = 'https://cloud-api.yandex.net/v1'
const YD_MEDIA_TYPE_VIDEO = 'video'

async function createRequest(token, path, options = { method: 'GET' }) {
    const requestPromise = fetch(`${YD_URL_PREFIX}/${path}/`, {
        headers: {
            'Authorization': `OAuth ${token}`,
            'Content-Type': 'application/json',
        },
        ...options
    })

    const result = await savedAsync(requestPromise)

    if (result[1]) {
        return result
    }

    const [response] = result
    const json = await response.json()

    if (json.error) {
        return [undefined, json]
    }

    return [json]
}

export default class YDApi {
    #token
    constructor(token) {
        this.#token = token;
    }

    async get(path) {
        return await createRequest(this.#token, path)
    }

    async put(path, body) {
        return await createRequest(this.#token, path, {
            method: 'PUT',
            body: JSON.stringify(body)
        })
    }

    async disk() {
        return await this.get('disk')
    }

    async diskResources(params) {
        const pathParams = new URLSearchParams(params)
        return await this.get('disk/resources?' + pathParams)
    }

    async publish(params, settings) {
        const pathParams = new URLSearchParams(params)
        return await this.put('disk/resources/publish?' + pathParams, settings)
    }

    async unpublish(params, settings) {
        const pathParams = new URLSearchParams(params)
        return await this.put('disk/resources/unpublish?' + pathParams, settings)
    }

    async getVideoFiles(dir) {
        const result = await this.diskResources({ path: dir, limit: 250, fields: '_embedded.items.path,_embedded.items.name,_embedded.items.media_type,_embedded.items.public_url,' })

        if (result[1]) {
            return result
        }

        const videoFiles = result[0]?._embedded?.items?.filter(({ media_type }) => media_type === YD_MEDIA_TYPE_VIDEO)
        return [videoFiles]
    }

    async publishFiles(files, settings) {
        const unpubleshedFiles = files.filter(({ public_url }) => !public_url)

        if (!unpubleshedFiles?.length) {
            return []
        }

        const publishResult = await Promise.all(unpubleshedFiles.map(({ path }) => this.publish({ path }, settings)))
        const withError = publishResult?.filter(([, error]) => !error)

        if (withError.length) {
            return [, withError[0][1]]
        }

        return [true]
    }

    async unpublishFiles(files, settings) {
        const publeshedFiles = files.filter(({ public_url }) => !!public_url)

        if (!publeshedFiles?.length) {
            return []
        }

        const unpublishResult = await Promise.all(publeshedFiles.map(({ path }) => this.unpublish({ path }, settings)))
        const withError = unpublishResult?.filter(([, error]) => !error)

        if (withError.length) {
            return [, withError[0][1]]
        }

        return [true]
    }
}