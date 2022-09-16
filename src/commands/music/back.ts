import {
	ApplicationCommandType,
	EmbedBuilder,
} from 'discord.js';

import { Command } from '../../structures/Command';
import { queue } from '../../structures/Client';
import { videoPlayer } from '../../commands/music/play';
/**
 * Goes back a song from the queue
 */
export default new Command({
	name: 'back',
	description: 'Goes back a song.',
	type: ApplicationCommandType.ChatInput,
	run: async ({ interaction }): Promise<void> => {
		const songQueue = queue.get(interaction.commandGuildId!);
		const response = new EmbedBuilder()
			.setColor('#f22222')
			.setDescription('Not playing anything.');

		if (songQueue?.player && songQueue?.songs[0]) {
			if (songQueue.loopCounter > 0) songQueue.loopCounter--;

			// Add the past song to the queue
			songQueue.songIndex--;
			songQueue.songs.unshift(songQueue.fullQueue[songQueue.songIndex]);

			videoPlayer(
				interaction.commandGuildId!,
				songQueue.songs[0]);
			response.setDescription('Went back!');
		}

		await interaction.editReply({ embeds: [response] });
		return;
	},
});
