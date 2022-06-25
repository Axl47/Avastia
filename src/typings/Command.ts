import {SuperClient} from "../structures/Client"

interface RunOptions {
	client: SuperClient,
	interaction: CommandInteraction,
	args: CommandInteractionOptionResolver
}

type RunFunction = (options: RunOptions) => any;

export type CommandType = {
	
} & ChatInputApplicationCommandData