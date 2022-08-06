import {
	ApplicationCommandType,
	ApplicationCommandOptionType,
	EmbedBuilder,
} from 'discord.js';
import { MessagePrompter } from '@sapphire/discord.js-utilities';
import { search } from 'play-dl';

import {
	createQueue,
	initiateEvents,
	videoPlayer,
} from './play';
import { Command } from '../../structures/Command';
import { queue } from '../../structures/Client';
import { Song } from '../../structures/Song';

/**
 * Searches a song and lets the user choose
 * which to play
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
		const response = new EmbedBuilder()
			.setColor('#15b500')
			.setDescription('Empty');

		if (!interaction.member.voice.channel) {
			/* eslint-disable-next-line max-len */
			response.setDescription(`You need to be in a voice channel to execute this command ${interaction.user}!`);
			await interaction.followUp({ embeds: [response] });
			return;
		}

		const voiceChannel =
			interaction.guild?.voiceStates.cache.get(interaction.user.id)?.channel;

		if (!voiceChannel) {
			interaction.followUp('Error while getting voice channel.');
			return;
		}
		if (!interaction.channel) {
			interaction.followUp('Error while getting text channel.');
			return;
		}

		const guildId = interaction.commandGuildId!;
		const channel = interaction.channel;

		if (!queue.get(guildId)) {
			try {
				queue.set(guildId,
					await createQueue(voiceChannel, channel, interaction));
			}
			catch (e) {
				interaction.followUp('Error while creating queue');
				console.error(e);
				return;
			}
		}

		const songQueue = queue.get(guildId);
		if (!songQueue) {
			interaction.followUp('Error while creating queue.');
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
		interaction.followUp({ embeds: [response] });

		const handler = new MessagePrompter('Play which one?', 'number', {
			start: 1,
			end: 6,
			timeout: 15000,
		});
		let result =
			await handler.run(interaction.channel as never, interaction.user);
		const first = (songQueue.songs.length) ? false : true;

		if (typeof result === 'number') {
			result--;

			if (!ytInfo[result].url) {
				response.setDescription('Error searching for song.');
				interaction.channel.send({ embeds: [response] });
				return;
			}

			const song: Song = {
				title: ytInfo[result].title ?? 'Untitled',
				url: ytInfo[result].url,
				duration: ytInfo[result].durationRaw,
				durationSec: ytInfo[result].durationInSec,
			};

			songQueue.songs.push(song);
			/* eslint-disable-next-line max-len */
			response.setDescription(`Queued [${songQueue.songs.at(-1)?.title}](${songQueue.songs.at(-1)?.url}) [${interaction.user}]`);
			interaction.channel.send({ embeds: [response] });

			if (first) {
				await videoPlayer(interaction.commandGuildId!, songQueue.songs[0]);
				initiateEvents(interaction.commandGuildId!);
				return;
			}
		}
		else {
			return;
		}
	},
});
