import {
	// EmbedBuilder,
	ApplicationCommandType,
} from 'discord.js';
// import { PaginatedMessage } from '@sapphire/discord.js-utilities';

import { Command } from '../../structures/Command';
// import { queue } from '../../structures/Client';
// import { Song } from '../../structures/Song';

/**
 * Sends the song queue to the channel
 */
export default new Command({
	name: 'queue',
	description: 'Shows the current queue',
	type: ApplicationCommandType.ChatInput,
	run: async ({ interaction }): Promise<void> => {
		await interaction.followUp('Maintenance in process :D');
		return;
		/*
		const songQueue = queue.get(interaction.commandGuildId!);

		if (!songQueue?.player) {
			const response = new EmbedBuilder()
				.setColor('#f22222')
				.setDescription('Not playing anything.');
			await interaction.followUp({ embeds: [response] });
			return;
		}

		let songs = '';

		const paginatedLyrics = new PaginatedMessage({
			template: new EmbedBuilder()
				.setColor('#ff0000'),
		});

		let index = 1;
		songQueue.songs.map(function(song: Song) {
			songs += `${index}) ${song.title} (${song.duration})\n`;
			index += 1;
		});

		const songsIndex = Math.round(songs.length / 4096) + 1;
		for (let i = 1; i <= songsIndex; ++i) {
			const b = i - 1;
			if (songs.trim().slice(b * 4096, i * 4096).length !== 0) {
				paginatedLyrics.addPageEmbed((embed: EmbedBuilder) => {
					return embed.setDescription(songs.slice(b * 4096, i * 4096));
				});
			}
		}

		await interaction.followUp('Queue:');
		await paginatedLyrics.run(interaction);
		return;
		*/
	},
});
