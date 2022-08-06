import {
	EmbedBuilder,
	ApplicationCommandType,
} from 'discord.js';

import { Command } from '../../structures/Command';
import { queue } from '../../structures/Client';

// TODO: Add toggling between looping queue
// or looping song

/**
 * Toggles looping the queue
 */
export default new Command({
	name: 'loop',
	description: 'Loops the queue',
	type: ApplicationCommandType.ChatInput,
	run: async ({ interaction }): Promise<void> => {
		const songQueue = queue.get(interaction.commandGuildId!);
		const response = new EmbedBuilder()
			.setColor('#f22222')
			.setDescription('Not playing anything.');

		if (songQueue) {
			songQueue.loop = !songQueue.loop;
			songQueue.loopCounter = 0;
			response
				.setDescription(songQueue.loop ? 'Now looping.' : 'Stopped looping.');
		}

		await interaction.followUp({ embeds: [response] });
		return;
	},
});
