import {
	TextBasedChannel,
	VoiceBasedChannel,
} from 'discord.js';
import {
	AudioPlayer,
	AudioResource,
	VoiceConnection,
} from '@discordjs/voice';

import { Song } from '../structures/Song';

/**
 * Interface for the song queue type
 * @interface QueueType
 */
export interface QueueType {
	voiceChannel: VoiceBasedChannel;
	textChannel: TextBasedChannel;
	connection: VoiceConnection;
	songs: Song[];
	stopped: boolean;
	loop: boolean;
	loopCounter: number;
	player?: AudioPlayer;
	audioResource?: AudioResource;
}
