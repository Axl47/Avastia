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
	stopped: boolean;
	loop: LoopState;
	loopCounter: number;
	songIndex: number;
	songs: Song[];
	fullQueue: Song[];
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
	 * @param {Song[]} q.songs - Songs to be played
	 * @param {boolean} q.stopped - Whether the player is stopped
	 * @param {LoopState} q.loop - Disabled, looping the song or the queue
	 * @param {number} q.loopCounter - What song index to play if looping
	 * @param {number} q.songIndex - The index of the played songs
	 * @param {SongPlayer} q.player - Player for video, optional before creation
	 * @param {number} q.volume - Volume at which to play the music
	 * @param {AudioResource} q.audioResource - Optional for saving resource
	 * @param {Song[]} q.fullQueue - All of the songs added to the queue
	 */
	constructor({
		voiceChannel, textChannel,
		connection, songs,
		stopped, loop,
		loopCounter, player,
		audioResource, fullQueue,
		songIndex, volume,
	}: QueueType) {
		this.voiceChannel = voiceChannel;
		this.textChannel = textChannel;
		this.connection = connection;
		this.songs = songs;
		this.stopped = stopped;
		this.loop = loop;
		this.loopCounter = loopCounter;
		this.songIndex = songIndex;
		this.player = player;
		this.volume = volume;
		this.audioResource = audioResource;
		this.fullQueue = fullQueue;
	}
}
