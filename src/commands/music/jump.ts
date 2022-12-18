import {
	ApplicationCommandType,
	ApplicationCommandOptionType,
	EmbedBuilder,
} from 'discord.js';

import { Command } from '../../structures/Command';
import { queue } from '../../structures/Client';
import { LoopState } from '../../typings/Queue';
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

			if (songQueue.loop !== LoopState.Disabled) {
				songQueue.loopCounter +=
					amount % (songQueue.songs.length - songQueue.songsPlayed);

				if (songQueue.loopCounter >= songQueue.songs.length) {
					songQueue.loopCounter -= songQueue.songs.length;
				}
			}
			else if (songQueue.songs.length < amount) {
				response
					.setTitle('Cannot jump that many songs.')
					.setDescription(
						`Queue length is ${songQueue.songs.length - songQueue.songsPlayed}`,
					);
			}
			else {
				songQueue.songsPlayed += amount;
				songQueue.songIndex += amount;
			}

			await videoPlayer(
				interaction.commandGuildId!,
				songQueue.songs[songQueue.songIndex + songQueue.loopCounter],
			);
			response.setDescription(`Jumped **${amount}** songs.`);
		}

		await interaction.editReply({ embeds: [response] });
		return;
	},
});
