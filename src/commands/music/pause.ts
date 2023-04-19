import { AudioPlayerStatus } from '@discordjs/voice';
import {
	ApplicationCommandType,
	EmbedBuilder,
} from 'discord.js';

import { queue } from '../../structures/Client';
import { Command } from '../../structures/Command';
import { Colors } from '../../typings/Colors';

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
			.setColor(Colors.Green)
			.setDescription('Not playing anything.');

		if (!songQueue?.player) {
			interaction.editReply({ embeds: [response] });
			return;
		}

		songQueue.player.state.status == AudioPlayerStatus.Paused ?
			(songQueue.player.unpause(), response.setDescription('Playback unpaused.')) :
			(songQueue.player.pause(true), response.setDescription('Playback paused.'));

		interaction.editReply({ embeds: [response] });
	},
});
