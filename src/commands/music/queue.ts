import {
	ApplicationCommandType,
	EmbedBuilder,
	type TextChannel,
} from 'discord.js';

import { queue } from '../../structures/Client.js';
import { randomColor } from '../../structures/Colors.js';
import { Command } from '../../structures/Command.js';
import { Song } from '../../structures/Song.js';
import { Pagination } from '../../utilities/PaginatedMessage.js';

/**
 * Sends the song queue to the channel
 */
export default new Command({
	name: 'queue',
	description: 'Shows the current queue',
	type: ApplicationCommandType.ChatInput,
	run: async ({ interaction }): Promise<void> => {
		const songQueue = queue.get(interaction.commandGuildId!);

		if (!songQueue?.player) {
			await interaction.editReply('Not playing anything.');
			return;
		}

		// Get all songs and turn them into a string
		// <index>) <song-title> (<song-duration>)\n
		const songs = songQueue.songs.slice(songQueue.songIndex).map(
			(song: Song, index) => {
				let message = `${index + 1}) ${song.title} (${song.duration})`;
				if (index === songQueue.songIndex + songQueue.loopCounter) {
					message = `\n${message} -> Current Song\n`;
				}
				return message;
			}).join('\n');

		const queueEmbeds: EmbedBuilder[] = [];

		// Create a new embed when the current one
		// exceeds the maximum character limit
		const songsIndex = Math.round((songs.length) / 4096) + 1;
		for (let i = 1; i <= songsIndex; ++i) {
			const b = i - 1;
			if (songs.trim().slice(b * 4096, i * 4096).length !== 0) {
				queueEmbeds.push(embedTemplate()
					.setDescription(songs.slice(b * 4096, i * 4096)));
			}
		}

		await interaction.editReply('Queue:');
		await new Pagination(
			interaction.channel as TextChannel,
			queueEmbeds,
		).paginate();
	},
});

const embedTemplate = (): EmbedBuilder => {
	return new EmbedBuilder()
		.setColor(randomColor());
};
