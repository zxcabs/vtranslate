export default function stopWithError(errorString) {
    console.error(errorString)
    process.exit(1)
}