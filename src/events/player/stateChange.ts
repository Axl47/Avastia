import { EmbedBuilder } from 'discord.js';
import { AudioPlayerStatus } from '@discordjs/voice';

import {
	author,
	channel,
	guildId,
	videoPlayer,
} from '../../commands/music/play';
import { queue } from '../../structures/Client';
import { LoopState } from '../../typings/Queue';
import { PlayerEvent } from '../../structures/PlayerEvent';

/**
 * @const {AudioPlayerStatus} oldState Previous state of the player
 * @default AudioPlayerStatus.Idle
 */
let oldState: AudioPlayerStatus = AudioPlayerStatus.Idle;

/**
 * Event called when the player changes state
 */
export default new PlayerEvent('stateChange', async (): Promise<void> => {
	const songQueue = queue.get(guildId);
	if (!songQueue?.player) return;

	switch (songQueue.player.state.status) {
		case AudioPlayerStatus.Playing:
			// If the player is currently playing, send the song to the channel
			const play = new EmbedBuilder()
				.setColor('#f22222')
				/* eslint-disable max-len */
				.setDescription(`Started playing [${songQueue.songs[songQueue.loopCounter].title}](${songQueue.songs[songQueue.loopCounter].url}) (${songQueue.songs[songQueue.loopCounter].duration}) [${author}]`);
			channel.send({ embeds: [play] });
			return;
		case AudioPlayerStatus.Idle:
			// If the player is currently idle, play next song
			if (oldState !== AudioPlayerStatus.Idle) {
				delete songQueue.audioResource;
				return;
			}
			playNextSong(guildId);
			break;
		default:
			return;
	}
	oldState = songQueue?.player?.state.status ?? AudioPlayerStatus.Idle;
});

/**
 * Function for playing the next song
 * or disconnecting if there is no more songs to play
 * @param {string} id The id of the guild
 */
export const playNextSong = async (id: string): Promise<void> => {
	const songQueue = queue.get(id);
	if (!songQueue) {
		return;
	}

	if (songQueue.stopped) {
		deleteQueue(id);
	}

	switch (songQueue.loop) {
		case LoopState.Disabled:
			// Delete the first song and make the second be [0]
			songQueue.songs.shift();
			break;
		case LoopState.Song:
			// Looping a song doesn't need any logic
			break;
		case LoopState.Queue:
			// Increment index,
			// make 0 if greater or equal to the length of the queue
			songQueue.loopCounter++;
			if (songQueue.loopCounter >= songQueue.songs.length) {
				songQueue.loopCounter = 0;
			}
			break;
		default:
			songQueue.loop = LoopState.Disabled;
			console.log('This should never happen');
	}

	if (songQueue.songs[0]) {
		// When there are songs, play the next one
		// When not looping, loopCounter is 0
		videoPlayer(id, songQueue.songs[songQueue.loopCounter]);
		return;
	}
	else {
		deleteQueue(id);
		return;
	}
};

/**
 * Delete a queue and all its references
 * @param {string} id The id of the guild to clear the queue from
 */
const deleteQueue = (id: string): void => {
	const songQueue = queue.get(id);
	// Delete all references to avoid memory leaks
	if (songQueue?.connection) {
		songQueue.connection.destroy();
	}
	if (songQueue?.player) {
		songQueue.player.stop();
		delete songQueue.player;
	}
	if (songQueue?.audioResource) {
		delete songQueue.audioResource;
	}
	queue.delete(id);
	return;
};
