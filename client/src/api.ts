const API_BASE = '/api'

export async function getJSON<T>(path: string = '/', params: Record<string, string>): Promise<T> {
    const query = new URLSearchParams(params)
    const queryString = (params ? `?${query.toString()}` : '')

    const response = await fetch(`${API_BASE}/${path}${queryString}`)

    if (!response.ok) {
        const err = await response.json()
        throw new Error(err.message || 'Failed to load directory')
    }

    return await response.json() as T
}