import {
	EmbedBuilder,
	ApplicationCommandType,
	TextChannel,
} from 'discord.js';

import { Command } from '../../structures/Command';
import { queue } from '../../structures/Client';
import { Pagination } from '../../utilities/PaginatedMessage';
import { Song } from '../../structures/Song';

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
			const response = new EmbedBuilder()
				.setColor('#f22222')
				.setDescription('Not playing anything.');
			await interaction.editReply({ embeds: [response] });
			return;
		}

		// Get all songs and turn them into a string
		// <index>) <song-title> (<song-duration>) \n
		const songs = songQueue.songs.map((song: Song, index) => {
			return `${index + 1}) ${song.title} (${song.duration})`;
		}).join('\n');

		const queueEmbeds: EmbedBuilder[] = [];

		// Create a new embed when the current one
		// exceeds the maximum character limit
		const songsIndex = Math.round(songs.length / 4096) + 1;
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
		return;
	},
});

const embedTemplate = (): EmbedBuilder => {
	return new EmbedBuilder()
		.setColor('#ff0000');
};
