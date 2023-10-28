import { MessagePrompter } from '@sapphire/discord.js-utilities';
import {
	ApplicationCommandOptionType,
	ApplicationCommandType,
	EmbedBuilder,
	type TextBasedChannel,
	type TextChannel,
	type User,
} from 'discord.js';
import { search } from 'play-dl';

import { queue } from '../../structures/Client.js';
import { randomColor } from '../../structures/Colors.js';
import { Command } from '../../structures/Command.js';
import { Song } from '../../structures/Song.js';
import {
	errorHandler,
	errorMessages,
	initiateEvents,
	videoPlayer,
} from './play.js';

/**
 * Searches a song and lets the
 * user choose which one to play
 */
export default new Command({
	name: 'search',
	description: 'Searches in youtube for a song',
	type: ApplicationCommandType.ChatInput,
	options: [
		{
			name: 'query',
			description: 'Search term',
			type: ApplicationCommandOptionType.String,
			required: true,
		},
	],
	run: async ({ interaction, args }): Promise<void> => {
		const author: User = interaction.user;
		const channel = interaction.channel as TextChannel;
		const guildId = interaction.commandGuildId!;

		const response = new EmbedBuilder()
			.setColor(randomColor())
			.setDescription('Empty');

		const message = await errorHandler(interaction);
		if (message != errorMessages.ERROR_HANDLER_SUCCESS) {
			await interaction.editReply(message);
			return;
		}

		const songQueue = queue.get(guildId);
		if (!songQueue) {
			await interaction.editReply(errorMessages.QUEUE_ERROR);
			return;
		}

		const query = args.getString('query', true);

		const ytInfo = await search(query, { limit: 5 });
		let videos = '';
		let index = 1;

		ytInfo.forEach((video) => {
			videos += `${index}) [${video.title ?? 'Untitled'}](${video.url})\n`;
			index++;
		});

		response.setDescription(videos);
		await interaction.editReply({ embeds: [response] });

		const handler = new MessagePrompter('Select song to play', 'number', {
			start: 1,
			end: 6,
			timeout: 15000,
		});

		let result =
			await handler.run(channel as TextBasedChannel, interaction.user);

		const first = (songQueue.songs.length) ? false : true;

		if (typeof result === 'number') {
			result--;

			const video = ytInfo[result];
			if (!video.url) {
				response.setDescription(errorMessages.NO_VIDEO_RESULT);
				await interaction.editReply({ embeds: [response] });
				return;
			}

			const song: Song = {
				title: video.title ?? 'Untitled',
				url: video.url,
				duration: video.durationRaw,
				durationSec: video.durationInSec,
				requester: author,
			};

			songQueue.songs.push(song);
			response.setDescription(
				`Queued [${song.title}](${song.url}) [${author}]`,
			);
			channel.send({ embeds: [response] });

			if (first) {
				// Start playback
				await videoPlayer(guildId, songQueue.songs[0]);

				// Start listening for player events
				initiateEvents(guildId);
			}
		}
	},
});
