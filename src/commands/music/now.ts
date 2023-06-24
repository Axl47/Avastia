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
		if (!songQueue?.player) {
			await interaction.editReply('Not playing anything.');
			return;
		}

		const song = songQueue.songs[songQueue.songIndex + songQueue.loopCounter];

		const response = new EmbedBuilder()
			.setColor('#f22222')
			.setTitle('Now Playing...')
			.setDescription(
				`[${song.title}](${song.url}) (${song.duration}) [${interaction.user}]`,
			);
		await interaction.editReply({ embeds: [response] });
	},
});
