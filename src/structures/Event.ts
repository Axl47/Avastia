import { ClientEvents } from 'discord.js';

/**
 * Class for the client events
 * @extends ClientEvents
 */
export class Event<Key extends keyof ClientEvents> {
	/**
	 * Constuctor for the client event
	 * @constructor
	 * @param {Key} event Event Key
	 * @param {Function} run Async function to run
	 */
	constructor(
		public event: Key,
		public run: (...args: ClientEvents[Key]) => Promise<void>,
	) {
		return;
	}
}
