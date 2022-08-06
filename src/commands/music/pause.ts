import {
	EmbedBuilder,
	ApplicationCommandType,
} from 'discord.js';

import { Command } from '../../structures/Command';
import { queue } from '../../structures/Client';

// TODO: Maybe merge unpause with pause

/**
 * Command for unpausing the player
 */
export default new Command({
	name: 'pause',
	description: 'Pauses the player',
	type: ApplicationCommandType.ChatInput,
	run: async ({ interaction }): Promise<void> => {
		const songQueue = queue.get(interaction.commandGuildId!);
		const response = new EmbedBuilder()
			.setColor('#f22222')
			.setDescription('Not playing anything.');

		if (songQueue?.player) {
			songQueue.player.pause();
			response.setDescription('Playback paused.');
		}

		interaction.followUp({ embeds: [response] });
		return;
	},
});
