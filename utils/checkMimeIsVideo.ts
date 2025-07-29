const START_MIME_VIDEO = 'video'

export default function checkMimeIsVideo(mime: string): Boolean {
    return mime?.startsWith(START_MIME_VIDEO)
}