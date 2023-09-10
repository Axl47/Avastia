import {
	ApplicationCommandType,
	EmbedBuilder,
} from 'discord.js';

import { deleteQueue } from '../../events/player/stateChange.js';
import { queue } from '../../structures/Client.js';
import { randomColor } from '../../structures/Colors.js';
import { Command } from '../../structures/Command.js';

/**
 * Command for deleting the queue
 */
export default new Command({
	name: 'delete',
	description: 'Deletes the queue',
	type: ApplicationCommandType.ChatInput,
	run: async ({ interaction }): Promise<void> => {
		const songQueue = queue.get(interaction.commandGuildId!);
		if (!songQueue?.player) {
			await interaction.editReply('Not playing anything.');
			return;
		}

		deleteQueue(interaction.commandGuildId!);

		const response = new EmbedBuilder()
			.setColor(randomColor())
			.setDescription('Queue deleted!');
		await interaction.editReply({ embeds: [response] });
	},
});
