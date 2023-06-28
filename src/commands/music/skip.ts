import {
	ApplicationCommandType,
	EmbedBuilder,
} from 'discord.js';

import { playNextSong } from '../../events/player/stateChange';
import { queue } from '../../structures/Client';
import { randomColor } from '../../structures/Colors';
import { Command } from '../../structures/Command';
import { LoopState } from '../../typings/Queue';

/**
 * Skips the current song and plays the next one
 */
export default new Command({
	name: 'skip',
	description: 'Skips to the next song',
	type: ApplicationCommandType.ChatInput,
	run: async ({ interaction }): Promise<void> => {
		const songQueue = queue.get(interaction.commandGuildId!);
		if (!songQueue?.player) {
			await interaction.editReply('Not playing anything.');
			return;
		}

		if (songQueue.loop === LoopState.Song) {
			songQueue.loopCounter++;
		}

		await playNextSong(interaction.commandGuildId!);

		const response = new EmbedBuilder()
			.setColor(randomColor())
			.setDescription('Not playing anything.');
		response.setDescription('Song skipped.');
		await interaction.editReply({ embeds: [response] });
	},
});
