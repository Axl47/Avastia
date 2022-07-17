import { CommandInteraction, CommandInteractionOptionResolver, PermissionResolvable, ChatInputApplicationCommandData, GuildMember } from 'discord.js'
import { SuperClient } from "../structures/Client"


export interface SuperInteraction extends CommandInteraction {
	member: GuildMember;
}

interface RunOptions {
	client: SuperClient,
	interaction: SuperInteraction,
	args: CommandInteractionOptionResolver
}

type RunFunction = (options: RunOptions) => any;

export type CommandType = {
	userPermissions?: PermissionResolvable[];
	run: RunFunction;
} & ChatInputApplicationCommandData;