import {
	ApplicationCommandType,
	EmbedBuilder,
} from 'discord.js';

import { deleteQueue } from '../../events/player/stateChange';
import { queue } from '../../structures/Client';
import { Command } from '../../structures/Command';

/**
 * Command for deleting the queue
 */
export default new Command({
	name: 'delete',
	description: 'Deletes the queue',
	type: ApplicationCommandType.ChatInput,
	run: async ({ interaction }): Promise<void> => {
		const songQueue = queue.get(interaction.commandGuildId!);
		const response = new EmbedBuilder()
			.setColor('#f22222')
			.setDescription('Not playing anything.');

		if (songQueue?.songs) {
			songQueue.songs = [];
			deleteQueue(interaction.commandGuildId!);
			response.setDescription('Queue deleted!');
		}

		await interaction.editReply({ embeds: [response] });
	},
});
