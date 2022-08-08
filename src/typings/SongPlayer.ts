import { AudioPlayer } from '@discordjs/voice';
import { Awaitable } from 'discord.js';

import { AudioPlayerEvents } from '../typings/PlayerEvents';

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
