import { exec } from 'child_process'
import { promisify } from 'util'
import type { VideoInfoAudioTrack, VideoInfoSubtitle, VideoInfo } from '../../types/VideoInfo'

const enum FfprobeStreamCodeType {
    Video = 'video',
    Audio = 'audio',
    Subtitle = 'subtitle',
}

interface FfprobeStream {
    codec_type: FfprobeStreamCodeType | string
    codec_name: string
    tags?: {
        language?: string
        title?: string
    }
}

interface FfprobeFormat {
    duration?: string
}

interface FfprobeOutput {
    streams: FfprobeStream[]
    format: FfprobeFormat
}

const execAsync = promisify(exec)

export async function getVideoFileProbe(resolvedPath: string): Promise<VideoInfo> {
    const { stdout } = await execAsync(`ffprobe -v quiet -print_format json -show_format -show_streams "${resolvedPath}"`)
    const data = JSON.parse(stdout) as FfprobeOutput

    return {
        duration: parseFloat(data.format.duration || '0'),
        videoCodec: data.streams.find((s) => s.codec_type === FfprobeStreamCodeType.Video)?.codec_name || 'unknown',
        audioTracks: data.streams
            .filter((s) => s.codec_type === FfprobeStreamCodeType.Audio)
            .map(
                (s): VideoInfoAudioTrack => ({
                    lang: s.tags?.language || 'und',
                    codec: s.codec_name,
                    title: s.tags?.title,
                }),
            ),
        subtitles: data.streams
            .filter((s) => s.codec_type === FfprobeStreamCodeType.Subtitle)
            .map(
                (s): VideoInfoSubtitle => ({
                    lang: s.tags?.language || 'und',
                    codec: s.codec_name,
                    title: s.tags?.title,
                }),
            ),
    }
}
