export default async function savedAsync(promise) {
    try {
        return [await promise]
    } catch (error) {
        return [undefined, error]
    }
}
