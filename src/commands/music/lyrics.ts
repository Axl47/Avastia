import {
	ApplicationCommandOptionType,
	ApplicationCommandType,
	EmbedBuilder,
	type TextChannel,
} from 'discord.js';
import { Client as GeniusClient } from 'genius-lyrics';

import { queue } from '../../structures/Client';
import { Command } from '../../structures/Command';
import { Pagination } from '../../utilities/PaginatedMessage';

/**
 * Sends the lyrics from the current
 * song or from a query to the channel
 */
export default new Command({
	name: 'lyrics',
	description: 'Sends the lyrics of the current song or a search',
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
		let title = args.getString('title') ?? '';
		const genius = new GeniusClient(process.env.geniusKey);

		// If a title is not specified, use the current song title
		if (title == '') {
			const songQueue = queue.get(interaction.commandGuildId!);

			if (!songQueue?.player) {
				await interaction.editReply('Provide a title or start playing something.');
				return;
			}

			title =
				songQueue.songs[songQueue.songIndex + songQueue.loopCounter].title;
		}

		try {
			const song = (await genius.songs.search(title))[0];
			const lyrics = await song.lyrics();
			const lyricsIndex = Math.round(lyrics.length / 4096) + 1;
			const lyricEmbeds: EmbedBuilder[] = [];

			// Truncate the lyrics into the Embed limits
			for (let i = 1; i <= lyricsIndex; ++i) {
				const b = i - 1;
				if (lyrics.trim().slice(b * 4096, i * 4096).length !== 0) {
					lyricEmbeds.push(embedTemplate(song.title)
						.setDescription(lyrics.slice(b * 4096, i * 4096)));
				}
			}

			await interaction.editReply('Lyrics generated:');
			await new Pagination(
				interaction.channel as TextChannel,
				lyricEmbeds,
			).paginate();
		}
		// Should only happen when something
		// goes wrong with the Genius API
		catch (e) {
			console.log(e);
			await interaction.editReply('Something went wrong :(');
		}
	},
});

const embedTemplate = (title: string): EmbedBuilder => {
	return new EmbedBuilder()
		.setColor('#ff0000')
		.setTitle(title)
		.setFooter({
			text: 'Provided by genius.com',
			iconURL:
				'https://assets.genius.com/images/apple-touch-icon.png?1652977688',
		});
};
