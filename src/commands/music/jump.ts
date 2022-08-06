import {
	ApplicationCommandType,
	ApplicationCommandOptionType,
	EmbedBuilder,
} from 'discord.js';

import { Command } from '../../structures/Command';
import { queue } from '../../structures/Client';
import { videoPlayer } from './play';

/**
 * Skips the specified number of songs from the queue
 */
export default new Command({
	name: 'jump',
	description: 'Jumps X songs.',
	type: ApplicationCommandType.ChatInput,
	options: [
		{
			name: 'amount',
			description: 'Amount to skip.',
			type: ApplicationCommandOptionType.Integer,
			required: true,
		},
	],
	run: async ({ interaction, args }): Promise<void> => {
		const songQueue = queue.get(interaction.commandGuildId!);
		const response = new EmbedBuilder()
			.setColor('#f22222')
			.setDescription('Not playing anything.');

		if (songQueue) {
			const amount = args.getInteger('amount', true);
			if (songQueue.loop) {
				if (songQueue.songs.length < amount + songQueue.loopCounter) {
					let number = amount;
					while (number) {
						songQueue.loopCounter++;
						if (songQueue.loopCounter >= songQueue.songs.length) {
							songQueue.loopCounter = 0;
						}
						number--;
					}
				}
				else {
					songQueue.loopCounter += amount;
				}
			}
			else if (songQueue.songs.length < amount) {
				response
					.setTitle('Cannot jump that many songs.')
					.setDescription(`Queue length is ${songQueue.songs.length}.`);
			}
			else {
				for (let i = 0; i < amount; i++) {
					songQueue.songs.shift();
				}
			}
			await videoPlayer(
				interaction.commandGuildId!,
				songQueue.songs[songQueue.loopCounter],
			);
			response.setDescription(`Jumped **${amount}** songs.`);
		}

		await interaction.followUp({ embeds: [response] });
		return;
	},
});
