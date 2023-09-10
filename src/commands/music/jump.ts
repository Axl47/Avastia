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
		if (amount > songQueue.songs.length - songQueue.songsPlayed) {
			await interaction.editReply(
				'Cannot jump that many songs.\n' +
				`Queue length is ${songQueue.songs.length - songQueue.songsPlayed}`,
			);
			return;
		}

		const newIndex = songQueue.songIndex + amount;
		songQueue.loopCounter =
			(songQueue.loop !== LoopState.Disabled) ?
				(songQueue.loopCounter + amount) % (songQueue.songs.length - songQueue.songsPlayed) :
				0;

		songQueue.songsPlayed = newIndex;
		songQueue.songIndex = newIndex;

		await videoPlayer(
			interaction.commandGuildId!,
			songQueue.songs[newIndex + songQueue.loopCounter],
		);

		const response = new EmbedBuilder()
			.setColor(randomColor())
			.setDescription(`Jumped **${amount}** songs.`);
		await interaction.editReply({ embeds: [response] });
	},
});
