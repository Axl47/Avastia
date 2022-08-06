import { ApplicationCommandDataResolvable } from 'discord.js';

/**
 * Interface for registering commands
 * @interface RegisterCommandOptions
 */
export interface RegisterCommandOptions {
	commands: ApplicationCommandDataResolvable[];
	guildId?: string;
}
