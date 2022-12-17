import { AudioPlayerStatus } from '@discordjs/voice';
import { EmbedBuilder } from 'discord.js';

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
 * Event called when the player changes state
 */
export default new PlayerEvent('stateChange',
	async (oldState, newState): Promise<void> => {
		const songQueue = queue.get(guildId);
		if (!songQueue?.player) {
			return;
		}

		switch (newState.status) {
			case AudioPlayerStatus.Playing:
				// If the player is currently playing, send the song to the channel
				const song = songQueue.songs[songQueue.loopCounter];
				const play = new EmbedBuilder()
					.setColor('#f22222')
					.setDescription(
						`Started playing [${song.title}](${song.url}) (${song.duration})` +
						`[${author}]`,
					);
				channel.send({ embeds: [play] });
				return;
			case AudioPlayerStatus.Idle:
				// If the player is currently idle, play next song
				delete songQueue.audioResource;
				playNextSong(guildId);
				break;
			default:
				return;
		}
	});

/**
 * Function for playing the next song
 * or disconnecting if there is no more songs to play
 * @param {string} id - The id of the guild
 */
export const playNextSong = async (id: string): Promise<void> => {
	const songQueue = queue.get(id);
	if (!songQueue) {
		return;
	}

	if (songQueue.stopped || songQueue.loopCounter >= songQueue.songs.length) {
		deleteQueue(id);
		return;
	}

	switch (songQueue.loop) {
		case LoopState.Disabled:
			// Delete the first song and make the second be [0]
			songQueue.songs.shift();
			songQueue.songIndex++;
			break;
		case LoopState.Song:
			// Looping a song doesn't need any logic
			break;
		case LoopState.Queue:
			// Increment index,
			// make 0 if greater or equal to the length of the queue
			songQueue.loopCounter++;
			songQueue.songIndex++;
			if (songQueue.loopCounter >= songQueue.songs.length) {
				songQueue.loopCounter = 0;
				// Reset song index to be the first song of the current queue
				songQueue.songIndex =
					songQueue.fullQueue.length - songQueue.songs.length;
			}
			break;
		default:
			songQueue.loop = LoopState.Disabled;
			console.log('Error while getting loop state.');
	}

	if (songQueue.songs[0]) {
		// When there are songs, play the next one
		// When not looping, loopCounter is 0
		await videoPlayer(id, songQueue.songs[songQueue.loopCounter]);
	}
	else {
		deleteQueue(id);
	}
	return;
};

/**
 * Delete a queue and all its references
 * @param {string} id - The id of the guild to clear the queue from
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
