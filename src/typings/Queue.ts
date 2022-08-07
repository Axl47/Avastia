import {
	TextBasedChannel,
	VoiceBasedChannel,
} from 'discord.js';
import {
	AudioResource,
	VoiceConnection,
} from '@discordjs/voice';

import { Song as SongType } from '../structures/Song';
import { SongPlayer } from './SongPlayer';

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
	songs: SongType[];
	stopped: boolean;
	loop: LoopState;
	loopCounter: number;
	player?: SongPlayer;
	audioResource?: AudioResource;
}
