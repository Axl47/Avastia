import {
	EmbedBuilder,
	ApplicationCommandType,
} from 'discord.js';

import { Command } from '../../structures/Command';
import { queue } from '../../structures/Client';

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

		if (songQueue) {
			const song = songQueue.songs[songQueue.loopCounter];
			const user = interaction.user;
			response
				.setTitle('Now Playing...')
				.setDescription(
					`[${song.title}](${song.url}) (${song.duration}) [${user}]`,
				);
		}

		await interaction.editReply({ embeds: [response] });
		return;
	},
});
