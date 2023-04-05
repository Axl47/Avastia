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
			.setDescription('Invalid number.');

		if (songQueue && amount >= 0) {
			await videoPlayer(
				interaction.commandGuildId!,
				songQueue.songs[songQueue.songIndex + songQueue.loopCounter],
				amount,
			);

			if (songQueue.songs[songQueue.loopCounter].durationSec > amount) {
				response.setDescription(`Seeked to ${amount}s!`);
			}
			else {
				// videoPlayer skips whenever an error is encountered,
				// such as seeking past song duration
				response.setDescription('Excedeed song duration, skipping...');
			}
		}

		await interaction.editReply({ embeds: [response] });
		return;
	},
});
