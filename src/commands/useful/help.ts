import {
	ApplicationCommandType,
	EmbedBuilder,
	type APIEmbedField,
} from 'discord.js';

import { commandsDescriptions } from '../../structures/Client.js';
import { randomColor } from '../../structures/Colors.js';
import { Command } from '../../structures/Command.js';

/**
 * Command that explains all possible commands
 */
export default new Command({
	name: 'help',
	description: 'Sends a message with all commands',
	type: ApplicationCommandType.ChatInput,
	run: async ({ interaction }): Promise<void> => {
		// Sorts the commands by name
		commandsDescriptions.sort((a, b) => a.name.localeCompare(b.name));

		const embedFields: APIEmbedField[] = [];

		for (let i = 1; i <= commandsDescriptions.length; i++) {
			if (i % 3 == 0) {
				embedFields.push(emptyEmbedField);
				continue;
			}

			const commandDescription = commandsDescriptions[i - 1];
			embedFields.push(newEmbedField(commandDescription.name, commandDescription.description));
		}

		const response = new EmbedBuilder()
			.setColor(randomColor())
			.setTitle('Commands:')
			.addFields(embedFields);

		interaction.editReply({ embeds: [response] });
		return;
	},
});

const newEmbedField = (name: string, value: string): APIEmbedField => {
	return {
		name: name,
		value: value,
		inline: true,
	};
};

const emptyEmbedField: APIEmbedField = { name: '\u200B', value: '\u200B' };
