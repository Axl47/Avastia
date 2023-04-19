import {
	ApplicationCommandType,
	EmbedBuilder,
} from 'discord.js';

import { Command } from '../../structures/Command';

/**
 * Command that explains all possible commands
 */
export default new Command({
	name: 'help',
	description: 'Sends a message with all commands',
	type: ApplicationCommandType.ChatInput,
	run: async ({ interaction }): Promise<void> => {
		const response = new EmbedBuilder()
			.setColor('#15b500')
			.setTitle('Commands:')
			.addFields(
				{
					name: '/play',
					value: 'Searches on Youtube/Spotify and plays the result.',
					inline: true,
				},
				{
					name: '/skip',
					value: 'Skips to the next song.',
					inline: true,
				},
				{ name: '\u200B', value: '\u200B' },

				{
					name: '/pause',
					value: 'Pauses or resumes the player.',
					inline: true,
				},
				{
					name: '/clear',
					value: 'Clears the queue.',
					inline: true,
				},
				{ name: '\u200B', value: '\u200B' },

				{
					name: '/stop',
					value: 'Disconnects the player.',
					inline: true,
				},
				{
					name: '/loop',
					value: 'Toogles looping the queue.',
					inline: true,
				},
				{ name: '\u200B', value: '\u200B' },

				{
					name: '/now',
					value: 'Sends the song currently playing.',
					inline: true,
				},
				{
					name: '/shuffle',
					value: 'Shuffles the queue.',
					inline: true,
				},
				{ name: '\u200B', value: '\u200B' },

				{
					name: '/queue',
					value: 'Sends the queue to the channel.',
					inline: true,
				},
				{
					name: '/lyrics',
					value: 'Sends the lyrics of the current or desired song',
					inline: true,
				},
				{ name: '\u200B', value: '\u200B' },

				{
					name: '/jump',
					value: 'Jumps x songs.',
					inline: true,
				},
				{
					name: '/remove',
					value: 'Removes the song with x title, or the x song in the queue.',
					inline: true,
				},
				{ name: '\u200B', value: '\u200B' },

				{
					name: '/rewind',
					value: 'Rewinds the current song.',
					inline: true,
				},
				{
					name: '/seek',
					value: 'Seeks to second on current song.',
					inline: true,
				},
				{ name: '\u200B', value: '\u200B' },

				{
					name: '/coin',
					value: 'Throws a coin.',
					inline: true,
				},
				{
					name: '/back',
					value: 'Goes back to previous song.',
					inline: true,
				},
				{ name: '\u200B', value: '\u200B' },
				{
					name: '/next',
					value: 'Adds a song to be played next, regardless of the queue.',
					inline: true,
				},
				{
					name: '/volume',
					value: 'Sets the song volume from 0 to 100.',
					inline: true,
				},
				{ name: '\u200B', value: '\u200B' },
				{
					name: '/search',
					value: 'Lets user choose between 5 songs.',
					inline: true,
				},
			);

		interaction.editReply({ embeds: [response] });
		return;
	},
});
