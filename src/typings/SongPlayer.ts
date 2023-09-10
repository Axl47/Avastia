import type { AudioPlayer } from '@discordjs/voice';
import type { Awaitable } from 'discord.js';

import type { AudioPlayerEvents } from '../typings/PlayerEvents.js';

/**
 * Class for an Audio Player
 * Necessary due to deletion of AudioPlayerEvents on voice 0.11
 * @extends {AudioPlayer}
 */
export interface SongPlayer extends AudioPlayer {
	on<K extends keyof AudioPlayerEvents>(
		event: K,
		listener: (...args: AudioPlayerEvents[K]) => Awaitable<void>): this;
}
