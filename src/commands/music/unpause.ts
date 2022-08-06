import {
	ApplicationCommandType,
	EmbedBuilder,
} from 'discord.js';

import { Command } from '../../structures/Command';
import { queue } from '../../structures/Client';

// TODO: Maybe merge unpause with pause

/**
 * Unpauses the player
 */
export default new Command({
	name: 'unpause',
	description: 'Unpauses the player',
	type: ApplicationCommandType.ChatInput,
	run: async ({ interaction }): Promise<void> => {
		const songQueue = queue.get(interaction.commandGuildId!);
		const response = new EmbedBuilder()
			.setColor('#f22222')
			.setDescription('Not playing anything.');

		if (songQueue?.player) {
			songQueue.player.unpause();
			response.setDescription('Playback paused.');
		}

		await interaction.followUp({ embeds: [response] });
		return;
	},
});
