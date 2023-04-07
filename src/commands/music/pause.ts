import { AudioPlayerStatus } from '@discordjs/voice';
import {
	ApplicationCommandType,
	EmbedBuilder,
} from 'discord.js';

import { queue } from '../../structures/Client';
import { Command } from '../../structures/Command';

/**
 * Command for pausing and unpausing the player
 */
export default new Command({
	name: 'pause',
	description: 'Pauses or resumes the player',
	type: ApplicationCommandType.ChatInput,
	run: async ({ interaction }): Promise<void> => {
		const songQueue = queue.get(interaction.commandGuildId!);
		const response = new EmbedBuilder()
			.setColor('#f22222')
			.setDescription('Not playing anything.');

		if (songQueue?.player) {
			if (songQueue.player.state.status == AudioPlayerStatus.Paused) {
				songQueue.player.unpause();
				response.setDescription('Playback unpaused.');
			}
			else {
				songQueue.player.pause(true);
				response.setDescription('Playback paused.');
			}
		}

		interaction.editReply({ embeds: [response] });
		return;
	},
});
