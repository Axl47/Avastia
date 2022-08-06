import { AudioPlayerEvents } from '@discordjs/voice';

/**
 * Class for the song player events
 * @extends AudioPlayerEvents
 */
export class PlayerEvent<Key extends keyof AudioPlayerEvents> {
	/**
	 * Constructor for the client event
	 * @constructor
	 * @param {Key} event Event Key
	 * @param {Function} run Async Function to run
	 */
	constructor(
		public event: Key,
		public run: () => Promise<void>,
	) {
		return;
	}
}
