import {
	ApplicationCommandOptionType,
	ApplicationCommandType,
	EmbedBuilder,
} from 'discord.js';

import { queue } from '../../structures/Client.js';
import { randomColor } from '../../structures/Colors.js';
import { Command } from '../../structures/Command.js';

/**
 * Removes a song from the queue
 * with an index or a query
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
		if (!songQueue?.player) {
			await interaction.editReply('Not playing anything.');
			return;
		}

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

		if (i >= songs.length) {
			await interaction.editReply('Song not in queue.');
			return;
		}

		const response = new EmbedBuilder()
			.setColor(randomColor())
			.setDescription(
				`Removed [${songs[i].title}](${songs[i].url})` +
				`[${interaction.user}]`,
			);

		songQueue.songs.splice(i, 1);

		await interaction.editReply({ embeds: [response] });
	},
});
