export interface VideoInfo {
    duration: number;
    videoCodec: string;
    audioTracks: {
        lang: string;
        codec: string;
        title?: string
    }[];
    subtitles: {
        lang: string;
        codec: string
    }[];
    error?: string
}
