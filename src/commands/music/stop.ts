import {
	ApplicationCommandType,
	EmbedBuilder,
} from 'discord.js';

import { playNextSong } from '../../events/player/stateChange';
import { queue } from '../../structures/Client';
import { Command } from '../../structures/Command';

/**
 * Stops the player
 */
export default new Command({
	name: 'stop',
	description: 'Stops the player',
	type: ApplicationCommandType.ChatInput,
	run: async ({ interaction }): Promise<void> => {
		const songQueue = queue.get(interaction.commandGuildId!);

		const response = new EmbedBuilder()
			.setColor('#f22222')
			.setDescription('Not playing anything.');

		if (!songQueue?.player) {
			await interaction.editReply({ embeds: [response] });
			return;
		}

		songQueue.stopped = true;

		// playNextSong takes care of stopping and deleting the queue
		await playNextSong(interaction.commandGuildId!);

		response.setDescription('Player stopped.');

		await interaction.editReply({ embeds: [response] });
	},
});
