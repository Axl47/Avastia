import { SongType } from '../typings/Song';

/**
 * Class for a song to be played
 * @implements {SongType}
 */
export class Song {
	title: string;
	url: string;
	duration: string;
	durationSec: number;
	/**
	 * Constructor for a new song
	 * @constructor
	 * @param {SongType} options The song options
	 * @param {string} options.title The title of the song
	 * @param {string} options.url The Youtube Url
	 * @param {string} options.duration The formatted duration (mm:ss)
	 * @param {number} options.durationSec The duration in seconds
	 */
	constructor({ title, url, duration, durationSec }: SongType) {
		this.title = title;
		this.url = url;
		this.duration = duration;
		this.durationSec = durationSec;
	}
}
