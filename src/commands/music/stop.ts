import {
	ApplicationCommandType,
	EmbedBuilder,
} from 'discord.js';

import { Command } from '../../structures/Command';
import { queue } from '../../structures/Client';
import { playNextSong } from '../../events/player/stateChange';

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

		if (songQueue?.player) {
			songQueue.stopped = true;
			// playNextSong takes care of stopping and deleting the queue
			await playNextSong(interaction.commandGuildId!);

			response.setDescription('Player stopped.');
		}

		await interaction.editReply({ embeds: [response] });
		return;
	},
});
