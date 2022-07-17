import { SongType } from "../typings/Song"

export class Song {
    title: string;
    url: string;
    duration: string;
    constructor({ title, url, duration }: SongType) {
        this.title = title;
        this.url = url;
        this.duration = duration;
    }
}