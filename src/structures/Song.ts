import { SongType } from '../typings/Song';
import { User } from 'discord.js';

/**
 * Class for a song to be played
 * @implements {SongType}
 */
export class Song {
	title: string;
	url: string;
	duration: string;
	durationSec: number;
	requester: User;
	spotify?: boolean;
	/**
	 * Constructor for a new song
	 * @constructor
	 * @param {SongType} options - The song options
	 * @param {string} options.title - The title of the song
	 * @param {string} options.url - The Youtube Url
	 * @param {string} options.duration - The formatted duration (mm:ss)
	 * @param {number} options.durationSec - The duration in seconds
	 * @param {User} options.requester - The user who requested the song
	 * @param {boolean} options.spotify - Comes from spotify or not
	 */
	constructor({
		title, url, duration, durationSec, requester, spotify,
	}: SongType) {
		this.title = title;
		this.url = url;
		this.duration = duration;
		this.durationSec = durationSec;
		this.requester = requester;
		this.spotify = spotify;
	}
}
