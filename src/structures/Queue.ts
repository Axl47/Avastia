import {
	TextBasedChannel,
	VoiceBasedChannel,
} from 'discord.js';
import {
	AudioResource,
	VoiceConnection,
} from '@discordjs/voice';

import { QueueType, LoopState } from '../typings/Queue';
import { Song } from './Song';
import { SongPlayer } from '../typings/SongPlayer';

/**
 * Class for the song queue
 * @implements {QueueType}
 */
export class Queue {
	voiceChannel: VoiceBasedChannel;
	textChannel: TextBasedChannel;
	connection: VoiceConnection;
	songs: Song[];
	stopped: boolean;
	loop: LoopState;
	loopCounter: number;
	player?: SongPlayer;
	audioResource?: AudioResource;
	/**
	 * Constructor for a new queue
	 * @constructor
	 * @param {QueueType} q - Options for the queue
	 * @param {VoiceBasedChannel} q.voiceChannel - Channel to play the video
	 * @param {TextBasedChannel} q.textChannel - Channel to send messages to
	 * @param {VoiceConnection} q.connection - Connection to the voice channel
	 * @param {Song[]} q.songs - Songs to be played
	 * @param {boolean} q.stopped - Whether the player is stopped
	 * @param {LoopState} q.loop - Disabled, looping the song or the queue
	 * @param {number} q.loopCounter - What song index to play if looping
	 * @param {SongPlayer} q.player - Player for video, optional before creation
	 * @param {AudioResource} q.audioResource - Optional for saving resource
	 */
	constructor({
		voiceChannel, textChannel,
		connection, songs,
		stopped, loop,
		loopCounter, audioResource,
		player,
	}: QueueType) {
		this.voiceChannel = voiceChannel;
		this.textChannel = textChannel;
		this.connection = connection;
		this.songs = songs;
		this.stopped = stopped;
		this.loop = loop;
		this.loopCounter = loopCounter;
		this.player = player;
		this.audioResource = audioResource;
	}
}
