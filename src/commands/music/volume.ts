import {
	ApplicationCommandOptionType,
	ApplicationCommandType,
	EmbedBuilder,
} from 'discord.js';

import { queue } from '../../structures/Client';
import { Command } from '../../structures/Command';

/**
 * Changes the volume of the player
 */
export default new Command({
	name: 'volume',
	description: 'Change the music volume',
	type: ApplicationCommandType.ChatInput,
	options: [
		{
			name: 'number',
			description: 'Volume for the music',
			type: ApplicationCommandOptionType.Integer,
			required: true,
		},
	],
	run: async ({ interaction, args }): Promise<void> => {
		const songQueue = queue.get(interaction.commandGuildId!);
		const volume = args.getInteger('number', true);
		const response = new EmbedBuilder()
			.setColor('#f22222')
			.setDescription('Not playing anything.');

		if (songQueue?.player && songQueue?.audioResource) {
			// Play the current song again
			if (volume < 0 || volume > 100) {
				response.setDescription('Number must be between 0 and 100.');
				await interaction.editReply({ embeds: [response] });
				return;
			}
			response.setDescription(
				`Volume changed from ${songQueue.volume} to ${volume}`,
			);
			songQueue.volume = volume;
			songQueue.audioResource.volume?.setVolumeLogarithmic(volume / 100);
		}

		await interaction.editReply({ embeds: [response] });
		return;
	},
});
