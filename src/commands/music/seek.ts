import {
	ApplicationCommandOptionType,
	ApplicationCommandType,
	EmbedBuilder,
} from 'discord.js';

import { queue } from '../../structures/Client.js';
import { randomColor } from '../../structures/Colors.js';
import { Command } from '../../structures/Command.js';
import { videoPlayer } from './play.js';

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
		const songQueue = queue.get(interaction.commandGuildId!);
		if (!songQueue?.player) {
			await interaction.editReply('Not playing anything.');
			return;
		}

		const amount = args.getInteger('seconds', true);
		if (amount <= 0) {
			await interaction.editReply('Amount must be greater than zero.');
			return;
		}

		const currentSong = songQueue.songs[songQueue.loopIndex];

		await videoPlayer(
			interaction.commandGuildId!,
			currentSong,
			amount,
		);

		const response = new EmbedBuilder()
			.setColor(randomColor())
			.setDescription(
				(currentSong.durationSec > amount) ?
					`Seeked to ${amount}s!` :
					'Excedeed song duration, skipping...',
			);
		await interaction.editReply({ embeds: [response] });
	},
});
