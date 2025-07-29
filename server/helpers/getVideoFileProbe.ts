import { exec } from 'child_process'
import { promisify } from 'util'
import { checkPath, resolvePath } from './path.ts'
import PathNotFoundError from '../errors/PathNotFoundError.ts'
import { type VideoInfo } from '../../types/VideoInfo.type.ts'

const execAsync = promisify(exec)

export async function getVideoFileProbe(filePath: string): Promise<VideoInfo> {
    const resolvedPath = resolvePath(filePath)

    if (!checkPath(resolvedPath)) {
        throw new PathNotFoundError(filePath)
    }

    try {
        const { stdout } = await execAsync(
            `ffprobe -v quiet -print_format json -show_format -show_streams "${resolvedPath}"`,
        )
        const data = JSON.parse(stdout)

        return {
            duration: parseFloat(data.format.duration || '0'),
            videoCodec: data.streams.find((s: any) => s.codec_type === 'video')?.codec_name || 'unknown',
            audioTracks: data.streams
                .filter((s: any) => s.codec_type === 'audio')
                .map((s: any) => ({
                    lang: s.tags?.language || 'und',
                    codec: s.codec_name,
                    title: s.tags?.title,
                })),
            subtitles: data.streams
                .filter((s: any) => s.codec_type === 'subtitle')
                .map((s: any) => ({
                    lang: s.tags?.language || 'und',
                    codec: s.codec_name,
                })),
        }
    } catch (err) {
        return {
            duration: 0,
            videoCodec: 'unknown',
            audioTracks: [],
            subtitles: [],
            error: err instanceof Error ? err.message : 'Unknown error',
        }
    }
}
