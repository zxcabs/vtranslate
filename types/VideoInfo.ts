export interface VideoInfoAudioTrack {
    lang: string
    codec: string
    title?: string
}

export interface VideoInfoSubtitle {
    lang: string
    codec: string
    title?: string
}

export interface VideoInfo {
    duration: number
    videoCodec: string
    audioTracks: VideoInfoAudioTrack[]
    subtitles: VideoInfoSubtitle[]
}
