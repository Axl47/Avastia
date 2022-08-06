import {
	ApplicationCommandType,
	ApplicationCommandOptionType,
	EmbedBuilder,
} from 'discord.js';

import { Command } from '../../structures/Command';
import { queue } from '../../structures/Client';
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
			name: 'second',
			description: 'amount to seek to',
			type: ApplicationCommandOptionType.Integer,
			required: true,
		},
	],
	run: async ({ interaction, args }): Promise<void> => {
		const amount = args.getInteger('second', true);

		const songQueue = queue.get(interaction.commandGuildId!);
		const response = new EmbedBuilder()
			.setColor('#f22222')
			.setDescription('Not playing anything.');

		if (songQueue) {
			await videoPlayer(
				interaction.commandGuildId!,
				songQueue.songs[songQueue.loopCounter],
				amount,
			);

			if (songQueue.songs[songQueue.loopCounter].durationSec > amount) {
				response.setDescription(`Seeked to ${amount}s!`);
			}
			else {
				response.setDescription('Excedeed song duration, skipping...');
			}
		}

		await interaction.followUp({ embeds: [response] });
		return;
	},
});
