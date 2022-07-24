import { SongType } from "../typings/Song"

export class Song {
    title: string;
    url: string;
    duration: string;
    durationSec: number;
    constructor({ title, url, duration, durationSec }: SongType) {
        this.title = title;
        this.url = url;
        this.duration = duration;
        this.durationSec = durationSec;
    }
}