import {
	ApplicationCommandType,
	EmbedBuilder,
} from 'discord.js';

import { queue } from '../../structures/Client';
import { randomColor } from '../../structures/Colors';
import { Command } from '../../structures/Command';

/**
 * Command for clearing the queue
 */
export default new Command({
	name: 'clear',
	description: 'Clears the queue',
	type: ApplicationCommandType.ChatInput,
	run: async ({ interaction }): Promise<void> => {
		const songQueue = queue.get(interaction.commandGuildId!);
		if (!songQueue?.player) {
			await interaction.editReply('Not playing anything.');
			return;
		}

		songQueue.songs.splice(songQueue.songIndex + songQueue.loopCounter);

		const response = new EmbedBuilder()
			.setColor(randomColor())
			.setDescription('Queue cleared!');
		await interaction.editReply({ embeds: [response] });
	},
});
