import type { CommandType } from '../typings/Command.js';

/**
 * Class for creating a command
 * @implements {CommandType}
 */
export class Command {
	/**
	 * Constructor for the bot commands
	 * @constructor
	 * @param {CommandType} commandOptions - The command options to add
	 */
	constructor(commandOptions: CommandType) {
		Object.assign(this, commandOptions);
	}
}
