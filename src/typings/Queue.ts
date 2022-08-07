import {
	TextBasedChannel,
	VoiceBasedChannel,
} from 'discord.js';
import {
	AudioPlayer,
	AudioResource,
	VoiceConnection,
} from '@discordjs/voice';

import { Song as SongType } from '../structures/Song';

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
	player?: AudioPlayer;
	audioResource?: AudioResource;
}
