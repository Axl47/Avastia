import {
	ApplicationCommandType,
	EmbedBuilder,
} from 'discord.js';

import { Command } from '../../structures/Command';
import { queue } from '../../structures/Client';
import { LoopState } from '../../typings/Queue';
import { playNextSong } from '../../events/player/stateChange';

/**
 * Skips the current song and plays the next one
 */
export default new Command({
	name: 'skip',
	description: 'Skips to the next song',
	type: ApplicationCommandType.ChatInput,
	run: async ({ interaction }): Promise<void> => {
		const songQueue = queue.get(interaction.commandGuildId!);
		const response = new EmbedBuilder()
			.setColor('#f22222')
			.setDescription('Not playing anything.');

		if (songQueue?.player) {
			if (songQueue.loop === LoopState.Song) {
				songQueue.loopCounter++;
			}
			await playNextSong(interaction.commandGuildId!);
			response.setDescription('Song skipped.');
		}

		await interaction.followUp({ embeds: [response] });
		return;
	},
});
