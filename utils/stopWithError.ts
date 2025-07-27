export default function stopWithError(errorString: string) {
    console.error(errorString)
    process.exit(1)
}