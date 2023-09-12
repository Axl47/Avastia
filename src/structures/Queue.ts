import type {
	AudioResource,
	VoiceConnection,
} from '@discordjs/voice';
import type {
	TextBasedChannel,
	VoiceBasedChannel,
} from 'discord.js';

import {
	LoopState,
	type QueueType,
} from '../typings/Queue.js';
import type { SongPlayer } from '../typings/SongPlayer.js';
import { Song } from './Song.js';

/**
 * Class for the song queue
 * @implements {QueueType}
 */
export class Queue {
	voiceChannel: VoiceBasedChannel;
	textChannel: TextBasedChannel;
	connection: VoiceConnection;
	stopped: boolean;
	loop: LoopState;
	loopIndex: number;
	songs: Song[];
	playedSongs: Song[];
	volume: number;
	player?: SongPlayer;
	audioResource?: AudioResource;
	/**
	 * Constructor for a new queue
	 * @constructor
	 * @param {QueueType} q - Options for the queue
	 * @param {VoiceBasedChannel} q.voiceChannel - Channel to play the video
	 * @param {TextBasedChannel} q.textChannel - Channel to send messages to
	 * @param {VoiceConnection} q.connection - Connection to the voice channel
	 * @param {boolean} q.stopped - Whether the player is stopped
	 * @param {LoopState} q.loop - Disabled, looping the song or the queue
	 * @param {LoopState} q.loopIndex - Index of the loop amount
	 * @param {Song[]} q.songs - Songs to be played
	 * @param {Song[]} q.playedSongs - Songs already played
	 * @param {number} q.volume - Volume at which to play the music
	 * @param {SongPlayer} q.player - Player for video, optional before creation
	 * @param {AudioResource} q.audioResource - Optional for saving resource
	 */
	constructor({
		voiceChannel, textChannel,
		connection, stopped,
		loop, loopIndex, songs,
		playedSongs, volume,
		player, audioResource,
	}: QueueType) {
		this.voiceChannel = voiceChannel;
		this.textChannel = textChannel;
		this.connection = connection;
		this.stopped = stopped;
		this.loop = loop;
		this.loopIndex = loopIndex;
		this.songs = songs;
		this.playedSongs = playedSongs;
		this.volume = volume;
		this.player = player;
		this.audioResource = audioResource;
	}
}
