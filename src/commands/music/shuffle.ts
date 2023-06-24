import {
	ApplicationCommandType,
	EmbedBuilder,
} from 'discord.js';

import { queue } from '../../structures/Client';
import { Command } from '../../structures/Command';
import { Song } from '../../structures/Song';

/**
 * Shuffles the song list
 */
export default new Command({
	name: 'shuffle',
	description: 'Shuffles the queue.',
	type: ApplicationCommandType.ChatInput,
	run: async ({ interaction }): Promise<void> => {
		const songQueue = queue.get(interaction.commandGuildId!);
		if (!songQueue?.player) {
			await interaction.editReply('Not playing anything.');
			return;
		}

		// Only shuffle the next songs
		const trueSongs = songQueue.songs.splice(songQueue.songIndex);
		shuffle(trueSongs);
		songQueue.songs = songQueue.songs.concat(trueSongs);

		const response = new EmbedBuilder()
			.setColor('#f22222')
			.setDescription('Queue shuffled.');
		await interaction.editReply({ embeds: [response] });
	},
});

// Shuffle implementation using the
// Fisher-Yates shuffle algorithm
const shuffle = (list: Song[]): Song[] => {
	const firstSong = list.shift()!;
	let currentIndex = list.length;
	let randomIndex: number;

	// While there remain elements to shuffle
	while (currentIndex != 0) {
		// Pick a remaining element
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex--;

		// And swap it with the current element.
		[list[currentIndex], list[randomIndex]] = [
			list[randomIndex],
			list[currentIndex],
		];
	}
	list.unshift(firstSong);
	return list;
};
