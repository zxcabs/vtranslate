export default async function savedAsync<T>(promise: Promise<T>): Promise<[T, undefined] | [undefined, Error]> {
    try {
        return [(await promise) as T, undefined]
    } catch (error) {
        return [undefined, error]
    }
}
