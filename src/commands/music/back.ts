import {
	ApplicationCommandType,
	EmbedBuilder,
} from 'discord.js';

import { videoPlayer } from '../../commands/music/play.js';
import { queue } from '../../structures/Client.js';
import { randomColor } from '../../structures/Colors.js';
import { Command } from '../../structures/Command.js';

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

		if (!songQueue.playedSongs[0]) {
			await interaction.editReply('Already at the first song.');
			return;
		}

		if (!songQueue.loop) {
			const song = songQueue.playedSongs.at(-1)!;

			songQueue.songs.unshift(song);
			songQueue.playedSongs.pop();
		}
		else {
			songQueue.loopIndex = (songQueue.loopIndex == 0) ?
				songQueue.songs.length - 1 :
				songQueue.loopIndex - 1;
		}

		videoPlayer(interaction.commandGuildId!, songQueue.songs[songQueue.loopIndex]);

		const response = new EmbedBuilder()
			.setColor(randomColor())
			.setDescription('Went back!');
		await interaction.editReply({ embeds: [response] });
	},
});
