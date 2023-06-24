import {
	ApplicationCommandType,
	EmbedBuilder,
} from 'discord.js';

import { videoPlayer } from '../../commands/music/play';
import { queue } from '../../structures/Client';
import { Command } from '../../structures/Command';
import { LoopState } from '../../typings/Queue';

/**
 * Goes back a song from the queue
 */
export default new Command({
	name: 'back',
	description: 'Goes back a song.',
	type: ApplicationCommandType.ChatInput,
	run: async ({ interaction }): Promise<void> => {
		const songQueue = queue.get(interaction.commandGuildId!);
		if (!songQueue?.player) {
			await interaction.editReply('Not playing anything.');
			return;
		}

		if (songQueue.loop !== LoopState.Disabled) {
			songQueue.loopCounter--;
		}
		else {
			songQueue.songIndex--;
			songQueue.songsPlayed--;
		}

		if (songQueue.songIndex < 0 || songQueue.loopCounter < 0) {
			if (songQueue.loop === LoopState.Disabled) {
				await interaction.editReply('Already at the start.');
				return;
			}

			songQueue.loopCounter =
				songQueue.songs.length - songQueue.songsPlayed - 1;
		}

		videoPlayer(
			interaction.commandGuildId!,
			songQueue.songs[songQueue.songIndex + songQueue.loopCounter]);

		const response = new EmbedBuilder()
			.setColor('#f22222')
			.setDescription('Went back!');
		await interaction.editReply({ embeds: [response] });
	},
});
