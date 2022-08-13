import {
	ApplicationCommandType,
	EmbedBuilder,
} from 'discord.js';

import { Command } from '../../structures/Command';
import { queue } from '../../structures/Client';
import { playNextSong } from '../../events/player/stateChange';

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
			songQueue.songs.unshift(songQueue.fullQueue[songQueue.songIndex - 1]);
			songQueue.songIndex--;
			playNextSong(interaction.commandGuildId!);
			response.setDescription('Went back!');
		}

		await interaction.followUp({ embeds: [response] });
		return;
	},
});
