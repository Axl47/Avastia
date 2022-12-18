import {
	ApplicationCommandType,
	EmbedBuilder,
} from 'discord.js';

import { Command } from '../../structures/Command';
import { queue } from '../../structures/Client';
import { videoPlayer } from './play';

/**
 * Replays the current song from the start
 */
export default new Command({
	name: 'rewind',
	description: 'Rewinds the current song',
	type: ApplicationCommandType.ChatInput,
	run: async ({ interaction }): Promise<void> => {
		const songQueue = queue.get(interaction.commandGuildId!);
		const response = new EmbedBuilder()
			.setColor('#f22222')
			.setDescription('Not playing anything.');

		if (songQueue?.player && songQueue?.songs[0]) {
			// Play the current song again
			await videoPlayer(
				interaction.commandGuildId!,
				songQueue.songs[songQueue.songIndex + songQueue.loopCounter]);
			response.setDescription('Rewinded!');
		}

		await interaction.editReply({ embeds: [response] });
		return;
	},
});
