import {
	ApplicationCommandOptionType,
	ApplicationCommandType,
	EmbedBuilder,
} from 'discord.js';

import { queue } from '../../structures/Client';
import { Command } from '../../structures/Command';
import { LoopState } from '../../typings/Queue';

/**
 * Toggles looping the queue
 */
export default new Command({
	name: 'loop',
	type: ApplicationCommandType.ChatInput,
	description: 'Loops the queue',
	options: [
		{
			name: 'disable',
			type: ApplicationCommandOptionType.Subcommand,
			description: 'Disable looping',
		},
		{
			name: 'song',
			type: ApplicationCommandOptionType.Subcommand,
			description: 'Loop the current song',
		},
		{
			name: 'queue',
			type: ApplicationCommandOptionType.Subcommand,
			description: 'Loop the entire queue',
		},
	],
	run: async ({ interaction, args }): Promise<void> => {
		const songQueue = queue.get(interaction.commandGuildId!);
		const response = new EmbedBuilder()
			.setColor('#f22222')
			.setDescription('Not playing anything.');

		if (songQueue) {
			switch (args.getSubcommand()) {
				case 'disable':
					songQueue.loop = LoopState.Disabled;
					songQueue.songsPlayed += songQueue.loopCounter;
					songQueue.songIndex += songQueue.loopCounter;
					songQueue.loopCounter = 0;
					response.setDescription('Looping is disabled.');
					break;
				case 'song':
					songQueue.loop = LoopState.Song;
					response.setDescription('Looping the current song.');
					break;
				case 'queue':
					songQueue.loop = LoopState.Queue;
					response.setDescription('Looping the queue.');
					break;
				default:
					interaction.editReply('Invalid command.');
					return;
			}
		}
		await interaction.editReply({ embeds: [response] });
		return;
	},
});
