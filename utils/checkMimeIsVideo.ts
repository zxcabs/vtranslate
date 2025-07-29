const START_MIME_VIDEO = 'video'

export default function checkMimeIsVideo(mime: string): boolean {
    return mime?.startsWith(START_MIME_VIDEO)
}
