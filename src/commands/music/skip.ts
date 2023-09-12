import {
	ApplicationCommandType,
	EmbedBuilder,
} from 'discord.js';

import { playNextSong } from '../../events/player/stateChange.js';
import { queue } from '../../structures/Client.js';
import { randomColor } from '../../structures/Colors.js';
import { Command } from '../../structures/Command.js';

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

		await playNextSong(interaction.commandGuildId!);

		const response = new EmbedBuilder()
			.setColor(randomColor())
			.setDescription('Song skipped.');
		await interaction.editReply({ embeds: [response] });
	},
});
