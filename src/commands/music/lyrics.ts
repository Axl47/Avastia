import {
	// EmbedBuilder,
	ApplicationCommandType,
	ApplicationCommandOptionType,
} from 'discord.js';
// import { Client as GeniusClient } from 'genius-lyrics';
// import { PaginatedMessage } from '@sapphire/discord.js-utilities';

import { Command } from '../../structures/Command';
// import { queue } from '../../structures/Client';

// const genius = new GeniusClient(process.env.geniusKey);

/**
 * Sends the lyrics from the current song
 * or from a query to the channel
 */
export default new Command({
	name: 'lyrics',
	description: 'Sends the lyrics of the current song',
	type: ApplicationCommandType.ChatInput,
	options: [
		{
			name: 'title',
			description: 'song to search',
			type: ApplicationCommandOptionType.String,
			required: false,
		},
	],
	run: async ({ interaction, args }): Promise<void> => {
		await interaction.followUp('Maintenance in process :D');
		return;
		// 	let title = args.getString('title') ?? '';

		// 	if (!title) {
		// 		const songQueue = queue.get(interaction.commandGuildId!);
		// 		if (songQueue) {
		// 			title = songQueue.songs[songQueue.loopCounter].title;
		// 		}
		// 		else {
		// 			const response = new EmbedBuilder()
		// 				.setColor('#ff0000')
		// 				.setDescription('Provide a title or start playing something.');
		// 			await interaction.followUp({ embeds: [response] });
		// 			return;
		// 		}
		// 	}

		// 	try {
		// 		const song = (await genius.songs.search(title))[0];
		// 		const lyrics = await song.lyrics();
		// 		const lyricsIndex = Math.round(lyrics.length / 4096) + 1;
		// 		const paginatedLyrics = new PaginatedMessage({
		// 			template: new EmbedBuilder()
		// 				.setColor('#ff0000')
		// 				.setTitle(song.title)
		// 				.setFooter({
		// 					text: 'Provided by genius.com',
		// 					iconURL:
		// 						'https://assets.genius.com/images/apple-touch-icon.png?1652977688',
		// 				}),
		// 		});

		// 		for (let i = 1; i <= lyricsIndex; ++i) {
		// 			const b = i - 1;
		// 			if (lyrics.trim().slice(b * 4096, i * 4096).length !== 0) {
		// 				paginatedLyrics.addPageEmbed((embed: EmbedBuilder) => {
		// 					return embed.setDescription(lyrics.slice(b * 4096, i * 4096));
		// 				});
		// 			}
		// 		}

		// 		await interaction.followUp('Lyrics generated:');
		// 		await paginatedLyrics.run(interaction);
		// 		return;
		// 	}
		// 	catch (e) {
		// 		console.log(e);
		// 		await interaction.followUp('Something went wrong :(');
		// 		return;
		// 	}
	},
});
