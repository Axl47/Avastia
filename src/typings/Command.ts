import type {
	ChatInputApplicationCommandData,
	CommandInteraction,
	CommandInteractionOptionResolver,
	GuildMember,
	PermissionResolvable,
} from 'discord.js';

import { SuperClient } from '../structures/Client';

// TODO: SuperInteraction might not be needed anymore
/**
 * CommandInteraction with access to member
 * @interface SuperClient
 * @extends CommandInteraction
 */
export interface SuperInteraction extends CommandInteraction {
	member: GuildMember;
}

/**
 * Parameters to pass to each command
 * @interface RunOptions
 */
interface RunOptions {
	client: SuperClient,
	interaction: SuperInteraction,
	args: CommandInteractionOptionResolver
}

type RunFunction = (options: RunOptions) => Promise<void>;

/**
 * Type for creating a command
 */
export type CommandType = {
	userPermissions?: PermissionResolvable[];
	run: RunFunction;
} & ChatInputApplicationCommandData;

/**
 * Type for creating a command description
 */
export type CommandDescriptionType = {
	name: string;
	description: string;
}
