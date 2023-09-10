import {
	ApplicationCommandType,
	EmbedBuilder,
} from 'discord.js';

import { deleteQueue } from '../../events/player/stateChange.js';
import { queue } from '../../structures/Client.js';
import { randomColor } from '../../structures/Colors.js';
import { Command } from '../../structures/Command.js';

/**
 * Stops the player
 */
export default new Command({
	name: 'stop',
	description: 'Stops the player',
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
			.setDescription('Player stopped.');
		await interaction.editReply({ embeds: [response] });
	},
});
