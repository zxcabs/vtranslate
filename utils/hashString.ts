import xxhash from 'xxhash-wasm'

export default async function getHashString(inputString: string): Promise<string> {
    const hasher = await xxhash()
    return hasher.h32ToString(inputString)
}
