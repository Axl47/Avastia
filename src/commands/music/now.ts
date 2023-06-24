import {
	ApplicationCommandType,
	EmbedBuilder,
} from 'discord.js';

import { queue } from '../../structures/Client';
import { Command } from '../../structures/Command';

/**
 * Sends the current playing song to the channel
 */
export default new Command({
	name: 'now',
	description: 'Displays the current song',
	type: ApplicationCommandType.ChatInput,
	run: async ({ interaction }): Promise<void> => {
		const songQueue = queue.get(interaction.commandGuildId!);
		const response = new EmbedBuilder()
			.setColor('#f22222')
			.setDescription('Not playing anything.');

		if (!songQueue?.songs) {
			await interaction.editReply({ embeds: [response] });
			return;
		}

		const song = songQueue.songs[songQueue.songIndex + songQueue.loopCounter];

		response
			.setTitle('Now Playing...')
			.setDescription(
				`[${song.title}](${song.url}) (${song.duration}) [${interaction.user}]`,
			);

		await interaction.editReply({ embeds: [response] });
	},
});
