import {
	ApplicationCommandType,
	EmbedBuilder,
} from 'discord.js';

import { randomColor } from '../../structures/Colors.js';
import { Command } from '../../structures/Command.js';

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
			.setColor(randomColor())
			.setDescription(
				`**${(coin >= 0.51) ? 'Cara | Heads' : 'Cruz | Tails'}**`,
			);

		interaction.editReply({ embeds: [newEmbed] });
		return;
	},
});
