import {
	ApplicationCommandType,
	EmbedBuilder,
} from 'discord.js';

import { Command } from '../../structures/Command';

/**
 * Randomly decides between heads or tails
 */
export default new Command({
	name: 'coin',
	description: 'Cara o Cruz | Head or Tails',
	type: ApplicationCommandType.ChatInput,
	run: async ({ interaction }): Promise<void> => {
		const coin = Math.random();
		const newEmbed = new EmbedBuilder()
			.setColor('#f22222')
			/* eslint-disable-next-line max-len */
			.setDescription(`Y el resultado es... **${(coin >= 0.51) ? 'Cara | Heads' : 'Cruz | Tails'}**`);

		interaction.editReply({ embeds: [newEmbed] });
		return;
	},
});
