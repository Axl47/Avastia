import {
	ApplicationCommandOptionType,
	ApplicationCommandType,
	EmbedBuilder,
} from 'discord.js';

import { queue } from '../../structures/Client.js';
import { randomColor } from '../../structures/Colors.js';
import { Command } from '../../structures/Command.js';
import { LoopState } from '../../typings/Queue.js';
import { videoPlayer } from './play.js';

/**
 * Skips the specified number of songs from the queue
 */
export default new Command({
	name: 'jump',
	description: 'Jumps X songs.',
	type: ApplicationCommandType.ChatInput,
	options: [
		{
			name: 'amount',
			description: 'Amount to skip.',
			type: ApplicationCommandOptionType.Integer,
			required: true,
		},
	],
	run: async ({ interaction, args }): Promise<void> => {
		const songQueue = queue.get(interaction.commandGuildId!);
		if (!songQueue?.player) {
			await interaction.editReply('Not playing anything.');
			return;
		}

		const amount = args.getInteger('amount', true);
		if (amount > songQueue.songs.length) {
			await interaction.editReply(
				'Cannot jump that many songs.\n' +
				`Queue length is ${songQueue.songs.length}`,
			);
			return;
		}

		if (songQueue.loop !== LoopState.Queue) {
			songQueue.playedSongs.concat(songQueue.songs.splice(0, amount));
		}
		else {
			songQueue.loopIndex = songQueue.songs.length % (amount + songQueue.loopIndex);
		}

		await videoPlayer(
			interaction.commandGuildId!,
			songQueue.songs[songQueue.loopIndex],
		);

		const response = new EmbedBuilder()
			.setColor(randomColor())
			.setDescription(`Jumped **${amount}** songs.`);
		await interaction.editReply({ embeds: [response] });
	},
});
