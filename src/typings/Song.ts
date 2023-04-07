import type { User } from 'discord.js';

/**
 * Type for creating a song to be played
 * @interface SongType
 */
export interface SongType {
	title: string;
	url: string;
	duration: string;
	durationSec: number;
	requester: User;
	spotify?: boolean;
}
