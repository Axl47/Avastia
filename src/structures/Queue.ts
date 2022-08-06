import {
	TextBasedChannel,
	VoiceBasedChannel,
} from 'discord.js';
import {
	AudioPlayer,
	AudioResource,
	VoiceConnection,
} from '@discordjs/voice';

import { QueueType } from '../typings/Queue';
import { Song } from './Song';

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
	loop: boolean;
	loopCounter: number;
	player?: AudioPlayer;
	audioResource?: AudioResource;
	/**
	 * Constructor for a new queue
	 * @constructor
	 * @param {QueueType} q Options for the queue
	 * @param {VoiceBasedChannel} q.voiceChannel Channel to play the video
	 * @param {TextBasedChannel} q.textChannel Channel to send messages to
	 * @param {VoiceConnection} q.connection Connection to the voice channel
	 * @param {Song[]} q.songs Songs to be played
	 * @param {boolean} q.stopped Whether the player is stopped
	 * @param {boolean} q.loop Whether to loop the queue
	 * @param {number} q.loopCounter What song index to play if looping
	 * @param {AudioPlayer} q.player Player for video, optional before creation
	 * @param {AudioResource} q.audioResource Optional for saving current resource
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
