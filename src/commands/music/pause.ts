import { AudioPlayerStatus } from '@discordjs/voice';
import {
	ApplicationCommandType,
	EmbedBuilder,
} from 'discord.js';

import { queue } from '../../structures/Client.js';
import { randomColor } from '../../structures/Colors.js';
import { Command } from '../../structures/Command.js';

/**
 * Command for pausing and unpausing the player
 */
export default new Command({
	name: 'pause',
	description: 'Pauses or resumes the player',
	type: ApplicationCommandType.ChatInput,
	run: async ({ interaction }): Promise<void> => {
		const songQueue = queue.get(interaction.commandGuildId!);
		if (!songQueue?.player) {
			await interaction.editReply('Not playing anything.');
			return;
		}

		const response = new EmbedBuilder()
			.setColor(randomColor())
			.setDescription('Empty.');

		songQueue.player.state.status == AudioPlayerStatus.Paused ?
			(songQueue.player.unpause(), response.setDescription('Playback unpaused.')) :
			(songQueue.player.pause(true), response.setDescription('Playback paused.'));

		await interaction.editReply({ embeds: [response] });
	},
});
