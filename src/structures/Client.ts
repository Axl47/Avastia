import {
	Client,
	Collection,
	GatewayIntentBits,
	type ApplicationCommandDataResolvable,
	type ClientEvents,
} from 'discord.js';
import glob from 'glob';
import { sep } from 'path';
import { promisify } from 'util';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

import { Queue } from '../structures/Queue.js';
import type { RegisterCommandOptions } from '../typings/Client.js';
import type { CommandDescriptionType, CommandType } from '../typings/Command.js';
import type { AudioPlayerEvents } from '../typings/PlayerEvents.js';
import { Event } from './Event.js';
import { PlayerEvent } from './PlayerEvent.js';

/**
 * Global map of all server queues
 */
export const queue = new Map<string, Queue>();

/**
 * Global map of all commands and their descriptions
 */
export const commandsDescriptions: Array<CommandDescriptionType> = [];

const globPromise = promisify(glob);

/**
 * Class for creating a Discord Client
 * with everything setup
 * @extends Client
 */
export class SuperClient extends Client {
	commands: Collection<string, CommandType> = new Collection();

	/**
	 * Constructor for the client
	 * @constructor
	 */
	constructor() {
		super({
			/**
			 * Intents required for the commands
			 * @param {GatewayIntentBits} Guilds - Access to guild
			 * @param {GatewayIntentBits} GuildsMessages - Access guild messages
			 * @param {GatewayIntentBits} GuildsVoiceStates - Access voice state
			 * @param {GatewayIntentBits} GuildsMessageReactions - Access reactions
			 */
			intents: [
				GatewayIntentBits.Guilds,
				GatewayIntentBits.GuildMessages,
				GatewayIntentBits.GuildVoiceStates,
				GatewayIntentBits.GuildMessageReactions,
			],
		});
	}

	/**
	 * Function for importing a file
	 * @param {string} filePath - Path for the file to import
	 * @private
	 */
	private async importFile(filePath: string) {
		return (await import(filePath))?.default;
	}

	/**
	 * Register commands to the server or globally
	 * @param {RegisterCommandOptions} o - Command options
	 * @param {ApplicationCommandDataResolvable[]} o.commands - Commands
	 * @private
	 */
	private registerCommands({ commands }: RegisterCommandOptions) {
		this.application?.commands.set(commands);
		console.log('Global registration...');
	}

	/**
	 * Create commands and events from .ts or .js files
	 * Commands come from the commands/ folder
	 * Events come from the events/ folder
	 * @private
	 */
	private async registerModules() {
		// Commands
		const slashCommands: ApplicationCommandDataResolvable[] = [];
		const commandFiles =
			await globPromise(
				`${__dirname.split(sep).join('/')}/../commands/*/*{.ts,.js}`,
			);

		commandFiles.forEach(async (filePath) => {
			const command: CommandType = await this.importFile(filePath);
			if (!command.name) return;

			commandsDescriptions.push({ name: command.name, description: command.description });
			this.commands.set(command.name, command);
			// 838258760731983872
			slashCommands.push(command);
		});

		this.on('ready', () => {
			this.registerCommands({
				commands: slashCommands,
			});
		});

		// events
		const eventFiles =
			await globPromise(
				`${__dirname.split(sep).join('/')}/../events/*{.ts,.js}`,
			);
		eventFiles.forEach(async (filePath) => {
			const event: Event<keyof ClientEvents> = await this.importFile(filePath);
			this.on(event.event, event.run);
		});
	}

	/**
	 * Register commands and login to Discord API
	 * @public
	 */
	public start() {
		this.registerModules();
		this.login(process.env.DSTOKEN);
	}

	/**
	 * Function for initiation of player events
	 * Called after player is created in commands/music/play initiateEvents
	 * @param {string} guildId - Guild to start events from
	 * @public
	 */
	public async playerEvents(guildId: string): Promise<void> {
		const songQueue = queue.get(guildId);
		if (!songQueue?.player) {
			return;
		}
		const eventFiles =
			await globPromise(
				`${__dirname.split(sep).join('/')}/../events/player/*{.ts,.js}`,
			);

		eventFiles.forEach(async (filePath) => {
			const event: PlayerEvent<keyof AudioPlayerEvents> =
				await this.importFile(filePath);
			songQueue.player?.on(event.event, event.run);
		});
	}
}
