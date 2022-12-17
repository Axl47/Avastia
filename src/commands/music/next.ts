import {
	ApplicationCommandType,
	ApplicationCommandOptionType,
	EmbedBuilder,
} from 'discord.js';

import { Command } from '../../structures/Command';
import { queue } from '../../structures/Client';
import { searchSong } from './play';

/**
 * Adds a song after the one that is currently playing
 */
export default new Command({
	name: 'next',
	description: 'Adds a song after the one that is currently playing',
	type: ApplicationCommandType.ChatInput,
	options: [
		{
			name: 'query',
			description: 'Search a song',
			type: ApplicationCommandOptionType.String,
			required: true,
		},
	],
	run: async ({ interaction, args }): Promise<void> => {
		const songQueue = queue.get(interaction.commandGuildId!);
		const response = new EmbedBuilder()
			.setColor('#f22222')
			.setDescription('Not playing anything.');

		if (songQueue?.player && songQueue?.songs[0]) {
			const url = args.getString('query', true);

			const song = await searchSong(url);
			if (song.url.includes('Invalid')) {
				await interaction.editReply('No video result found.');
				return;
			}
			songQueue.songs.splice(1, 0, song);
			songQueue.fullQueue.splice(songQueue.songIndex + 1, 0, song);

			response.setDescription(
				`Queued [${song.title}](${song.url}) (${song.duration}) ` +
				`[${interaction.user}]`);
		}

		await interaction.editReply({ embeds: [response] });
		return;
	},
});
