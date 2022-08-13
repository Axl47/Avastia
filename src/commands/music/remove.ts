import {
	ApplicationCommandType,
	ApplicationCommandOptionType,
	EmbedBuilder,
} from 'discord.js';

import { Command } from '../../structures/Command';
import { queue } from '../../structures/Client';

/**
 * Removes a song from the queue with an
 * index or a query
 */
export default new Command({
	name: 'remove',
	description: 'Removes a song from the queue.',
	type: ApplicationCommandType.ChatInput,
	options: [
		{
			name: 'query',
			description: 'what to remove',
			type: ApplicationCommandOptionType.String,
			required: true,
		},
	],
	run: async ({ interaction, args }): Promise<void> => {
		const songQueue = queue.get(interaction.commandGuildId!);
		const response = new EmbedBuilder()
			.setColor('#f22222')
			.setDescription('Not playing anything.');

		if (songQueue?.player) {
			let i = 0;
			const songs = songQueue.songs;
			const query = args.getString('query', true);

			// Loop through all songs, i should be the index of the found song
			for (i = 0; i < songs.length; i++) {
				if (songs[i].title.toLowerCase().includes(
					query.toLowerCase())) {
					break;
				}
			}

			if (i < songQueue.songs.length) {
				/* eslint-disable-next-line max-len */
				response.setDescription(`Removed [${songs[i].title}](${songs[i].url}) [${interaction.user}]`);
				songQueue.songs.splice(i, 1);
			}
			else {
				response.setDescription('Song not in queue.');
			}
		}
		await interaction.followUp({ embeds: [response] });
		return;
	},
});
