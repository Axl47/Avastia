import {
	ApplicationCommandType,
	EmbedBuilder,
} from 'discord.js';

import { queue } from '../../structures/Client.js';
import { randomColor } from '../../structures/Colors.js';
import { Command } from '../../structures/Command.js';

/**
 * Sends the current playing song to the channel
 */
export default new Command({
	name: 'now',
	description: 'Displays the current song',
	type: ApplicationCommandType.ChatInput,
	run: async ({ interaction }): Promise<void> => {
		const songQueue = queue.get(interaction.commandGuildId!);
		if (!songQueue?.player) {
			await interaction.editReply('Not playing anything.');
			return;
		}

		const song = songQueue.songs[songQueue.songIndex + songQueue.loopCounter];

		const response = new EmbedBuilder()
			.setColor(randomColor())
			.setTitle('Now Playing...')
			.setDescription(
				`[${song.title}](${song.url}) (${song.duration}) [${interaction.user}]`,
			);
		await interaction.editReply({ embeds: [response] });
	},
});
