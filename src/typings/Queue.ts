import type {
	AudioResource,
	VoiceConnection,
} from '@discordjs/voice';
import type {
	TextBasedChannel,
	VoiceBasedChannel,
} from 'discord.js';

import type { SongType } from '../typings/Song';
import type { SongPlayer } from './SongPlayer';

/**
 * Enum for queue looping state
 * @enum {number}
 */
export enum LoopState {
	Disabled,
	Song,
	Queue,
}

/**
 * Interface for the song queue type
 * @interface QueueType
 */
export interface QueueType {
	voiceChannel: VoiceBasedChannel;
	textChannel: TextBasedChannel;
	connection: VoiceConnection;
	stopped: boolean;
	loop: LoopState;
	loopCounter: number;
	songIndex: number;
	songs: SongType[];
	songsPlayed: number;
	volume: number;
	player?: SongPlayer;
	audioResource?: AudioResource;
}
