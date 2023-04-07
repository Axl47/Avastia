import {
	AudioPlayerError,
	AudioPlayerStatus,
	PlayerSubscription,
	type AudioPlayerState,
} from '@discordjs/voice';

/**
 * '@discordjs/voice v0.11.0' deleted AudioPlayerEvents
 * @interface AudioPlayerEvents
 */
export type AudioPlayerEvents = {
	error: [error: AudioPlayerError];
	debug: [message: string];
	stateChange:
	[oldState: AudioPlayerState, newState: AudioPlayerState];
	subscribe: [subscription: PlayerSubscription];
	unsubscribe: [subscription: PlayerSubscription];
} & {
		[status in AudioPlayerStatus]: [
			oldState: AudioPlayerState,
			newState: AudioPlayerState,
		];
	};
