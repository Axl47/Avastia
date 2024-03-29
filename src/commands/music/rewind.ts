import {
	ApplicationCommandType,
	EmbedBuilder,
} from 'discord.js';

import { queue } from '../../structures/Client.js';
import { randomColor } from '../../structures/Colors.js';
import { Command } from '../../structures/Command.js';
import { videoPlayer } from './play.js';

/**
 * Replays the current song from the start
 */
export default new Command({
	name: 'rewind',
	description: 'Rewinds the current song',
	type: ApplicationCommandType.ChatInput,
	run: async ({ interaction }): Promise<void> => {
		const songQueue = queue.get(interaction.commandGuildId!);
		if (!songQueue?.player) {
			await interaction.editReply('Not playing anything.');
			return;
		}

		// Play the current song again
		await videoPlayer(
			interaction.commandGuildId!,
			songQueue.songs[songQueue.loopIndex]);

		const response = new EmbedBuilder()
			.setColor(randomColor())
			.setDescription('Rewinded!');
		await interaction.editReply({ embeds: [response] });
	},
});
