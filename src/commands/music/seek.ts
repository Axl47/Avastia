import {
	ApplicationCommandOptionType,
	ApplicationCommandType,
	EmbedBuilder,
} from 'discord.js';

import { queue } from '../../structures/Client';
import { Command } from '../../structures/Command';
import { videoPlayer } from './play';

/**
 * Starts the song from the specified second
 */
export default new Command({
	name: 'seek',
	description: 'Seeks the current song to the specified second',
	type: ApplicationCommandType.ChatInput,
	options: [
		{
			name: 'seconds',
			description: 'amount to seek to',
			type: ApplicationCommandOptionType.Integer,
			required: true,
		},
	],
	run: async ({ interaction, args }): Promise<void> => {
		const amount = args.getInteger('seconds', true);
		const songQueue = queue.get(interaction.commandGuildId!);

		const response = new EmbedBuilder()
			.setColor('#f22222')
			.setDescription('Not playing anything.');

		if (!songQueue?.player) {
			await interaction.editReply({ embeds: [response] });
			return;
		}

		if (amount < 0) {
			response.setDescription('Invalid amount.');
			await interaction.editReply({ embeds: [response] });
			return;
		}

		const currentSong = songQueue.songs[songQueue.songIndex + songQueue.loopCounter];

		await videoPlayer(
			interaction.commandGuildId!,
			currentSong,
			amount,
		);

		response.setDescription(
			(currentSong.durationSec > amount) ?
				`Seeked to ${amount}s!` :
				'Excedeed song duration, skipping...',
		);

		await interaction.editReply({ embeds: [response] });
	},
});
