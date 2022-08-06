import { CommandType } from '../typings/Command';

/**
 * Class for creating a command
 * @implements {CommandType}
 */
export class Command {
	/**
	 * Constructor for the command
	 * @constructor
	 * @param {CommandName} commandOptions The command options to add
	 */
	constructor(commandOptions: CommandType) {
		Object.assign(this, commandOptions);
	}
}
