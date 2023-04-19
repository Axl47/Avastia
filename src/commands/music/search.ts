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

import { queue } from '../../structures/Client';
import { Command } from '../../structures/Command';
import { Song } from '../../structures/Song';
import {
	BAD_VOICE_CONNECTION,
	NO_VIDEO_RESULT_MESSAGE,
	NO_VOICE_CHANNEL_MESSAGE,
	QUEUE_NOT_FOUND,
	TEXT_CHANNEL_NOT_FOUND,
	VOICE_CHANNEL_NOT_FOUND,
	createQueue,
	initiateEvents,
	videoPlayer,
} from './play';

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
			.setColor('#15b500')
			.setDescription('Empty');

		if (!queue.get(interaction.commandGuildId!)?.player) {
			/* ------------------------- Basic Error Handling ------------------------- */
			if (!interaction.member.voice.channel) {
				await interaction.editReply(`${NO_VOICE_CHANNEL_MESSAGE} [${author}]`);
				return;
			}

			const voiceChannel =
				interaction.guild?.voiceStates.cache.get(interaction.user.id)?.channel;

			if (!voiceChannel) {
				await interaction.editReply(VOICE_CHANNEL_NOT_FOUND);
				return;
			}

			if (!interaction.channel) {
				await interaction.editReply(TEXT_CHANNEL_NOT_FOUND);
				return;
			}

			if (!queue.get(guildId)) {
				// Create a server queue with the server id as the key
				try {
					queue.set(guildId,
						await createQueue(voiceChannel, channel));
				}
				catch (e) {
					interaction.editReply(BAD_VOICE_CONNECTION);
					console.error(e);
					return;
				}
			}
		}


		const songQueue = queue.get(guildId);
		if (!songQueue) {
			await interaction.editReply(QUEUE_NOT_FOUND);
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
				response.setDescription(NO_VIDEO_RESULT_MESSAGE);
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
			await interaction.reply({ embeds: [response] });

			if (first) {
				// Start playback
				await videoPlayer(guildId, songQueue.songs[0]);

				// Start listening for player events
				initiateEvents(guildId);
			}
		}
	},
});
