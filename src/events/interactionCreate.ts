import { CommandInteractionOptionResolver } from 'discord.js';

import { client } from '../main.js';
import { Event } from '../structures/Event.js';
import type { SuperInteraction } from '../typings/Command.js';

/**
 * Event called when an interaction is created
 * (when user calls a command with '/')
 */
export default new Event('interactionCreate',
	async (interaction): Promise<void> => {
		if (!interaction) {
			return;
		}

		// If the interaction is a slash command
		if (interaction.isChatInputCommand()) {
			await interaction.deferReply();
			const command = client.commands.get(interaction.commandName);

			// Should only happen when registering commands has not
			// finished or calling a deleted command before refresh
			if (!command) {
				interaction.editReply('Non existent command');
				return;
			}

			command.run({
				args: interaction.options as CommandInteractionOptionResolver,
				client,
				interaction: interaction as SuperInteraction,
			});
		}
	});
