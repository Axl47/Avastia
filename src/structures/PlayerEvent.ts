import type { AudioPlayerEvents } from '../typings/PlayerEvents';

/**
 * Class for the song player events
 * @extends AudioPlayerEvents
 */
export class PlayerEvent<Key extends keyof AudioPlayerEvents> {
	/**
	 * Constructor for the player event
	 * @constructor
	 * @param {Key} event Event Key
	 * @param {Function} run Async Function to run
	 */
	constructor(
		public event: Key,
		public run: (...args: AudioPlayerEvents[Key]) => Promise<void>,
	) {
		return;
	}
}
