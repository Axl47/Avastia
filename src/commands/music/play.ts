import {
	createAudioPlayer,
	createAudioResource,
	joinVoiceChannel,
	NoSubscriberBehavior,
	type DiscordGatewayAdapterCreator,
} from '@discordjs/voice';
import {
	ApplicationCommandOptionType,
	ApplicationCommandType,
	EmbedBuilder,
	type TextChannel,
	type User,
	type VoiceBasedChannel,
} from 'discord.js';
import {
	is_expired as isExpired,
	playlist_info as playlistInfo,
	refreshToken,
	search,
	spotify,
	sp_validate as spValidate,
	stream,
	video_info as videoInfo,
	yt_validate as ytValidate,
	type InfoData,
	type SpotifyAlbum,
	type SpotifyTrack,
	type YouTubePlayList,
	type YouTubeVideo,
} from 'play-dl';

import { playNextSong } from '../../events/player/stateChange.js';
import { queue, SuperClient } from '../../structures/Client.js';
import { randomColor } from '../../structures/Colors.js';
import { Command } from '../../structures/Command.js';
import { Queue } from '../../structures/Queue.js';
import { Song } from '../../structures/Song.js';
import { LoopState } from '../../typings/Queue.js';
import type { SuperInteraction } from '../../typings/Command.js';
import type { SongPlayer } from '../../typings/SongPlayer.js';

/**
 * @type {string} - The id of the current guild
 */
export let guildId: string = '';

/**
 * @type {TextBasedChannel} - The channel to send messages to
 */
export let channel: TextChannel;

/**
 * @type {User} - The user of the interaction
 */
let author: User;

/**
 * @type {SuperClient} - Discord Client
 */
let bot: SuperClient;

/**
 * Messages for common errors
 */
export const errorMessages = {
	NO_VIDEO_RESULT: 'No video result found.',
	NO_VOICE_CHANNEL: 'You need to be in a voice channel to execute this command.',
	VOICE_CONNECTION_ERROR: 'Error while joining the channel.',
	VOICE_CHANNEL_ERROR: 'Error while getting voice channel.',
	TEXT_CHANNEL_ERROR: 'Error while getting text channel.',
	QUEUE_ERROR: 'Error while getting the server queue.',
	SPOTIFY_VALIDATION_ERROR: 'Error while validating Spotify link.',
	YOUTUBE_VALIDATION_ERROR: 'Error while validating YouTube link.',
	ERROR_HANDLER_SUCCESS: 'No errors were encountered.',
};

/**
 * Searches a song with a query on Spotify
 * or YouTube and adds it to the queue
 */
export default new Command({
	name: 'play',
	description: 'Plays a song',
	type: ApplicationCommandType.ChatInput,
	options: [
		{
			name: 'query',
			description: 'Search a song',
			type: ApplicationCommandOptionType.String,
			required: true,
		},
	],
	run: async ({ interaction, args, client }): Promise<void> => {
		bot = client;
		author = interaction.user;

		/* -------------------------- Check for any errors -------------------------- */
		const message = await errorHandler(interaction);
		if (message != errorMessages.ERROR_HANDLER_SUCCESS) {
			await interaction.editReply(message);
			return;
		}
		const songQueue = queue.get(guildId);
		if (!songQueue) {
			await interaction.editReply(errorMessages.QUEUE_ERROR);
			return;
		}

		// If there are no songs, then this is the first song
		const first = (songQueue.songs.length) ? false : true;

		const url = args.getString('query', true);

		// Handle the search for the song
		await handleUrl(url, interaction);

		if (first) {
			// Start playback
			await videoPlayer(guildId, songQueue.songs[0]);

			// Start listening for player events
			initiateEvents(guildId);
		}
	},
});

/**
 * Handles simple errors for play and search commands
 * @param {SuperInteraction} interaction - The interaction of the command
 * @return {Promise<string>} Error or success message
 */
export const errorHandler = async (interaction: SuperInteraction): Promise<string> => {
	if (!interaction.member.voice.channel) {
		return errorMessages.NO_VOICE_CHANNEL;
	}

	const voiceChannel =
		interaction.guild?.voiceStates.cache.get(author.id)?.channel;

	if (!voiceChannel) {
		return errorMessages.VOICE_CHANNEL_ERROR;
	}
	if (!interaction.channel) {
		return errorMessages.TEXT_CHANNEL_ERROR;
	}

	guildId = interaction.commandGuildId!;
	channel = interaction.channel as TextChannel;

	if (!queue.get(guildId)) {
		// Create a server queue with the server id as the key
		try {
			queue.set(guildId,
				await createQueue(voiceChannel, channel));
		}
		catch (e) {
			console.error(e);
			return errorMessages.VOICE_CONNECTION_ERROR;
		}
	};

	return errorMessages.ERROR_HANDLER_SUCCESS;
};

/**
 * Initiate events on the audio player
 * @param {string} id - The guild id of the player
 */
export const initiateEvents = (id: string): void => {
	bot.playerEvents(id);
};

/**
 * Function for creating a resource and playing audio
 * @param {string} id - The guild id of the player
 * @param {Song} song - The song to be played
 * @param {number} seek - Optional number to start the song from
 */
export const videoPlayer = async (
	id: string,
	song: Song,
	seek?: number,
): Promise<void> => {
	const songQueue = queue.get(id);
	if (!songQueue) {
		return;
	}

	if (!song) {
		await playNextSong(guildId);
		return;
	};

	// Delete past resource to avoid memory leaks
	delete songQueue.audioResource;

	try {
		// Create player if it doesn't exist
		if (!songQueue.player) {
			songQueue.player = createAudioPlayer({
				behaviors: { noSubscriber: NoSubscriberBehavior.Pause },
			}) as SongPlayer;

			// Subscribe the player to the voice connection
			if (!songQueue.connection) {
				songQueue.songs = [];
				playNextSong(id);
				return;
			}
			songQueue.connection.subscribe(songQueue.player);
		}

		// If the song comes from Spotify
		if (song.spotify) {
			// Search it on YouTube
			song = await searchSong(song.title);

			if (song.url.includes(errorMessages.NO_VIDEO_RESULT)) {
				throw new Error(errorMessages.NO_VIDEO_RESULT);
			}
		}

		// Create the stream for the player
		const songStream = await stream(song.url, { seek: seek });

		// TODO: Changing volume on the fly causes more performance cost
		// if Volume command isn't used, consider removing the command
		const resource = createAudioResource(songStream.stream,
			{ inputType: songStream.type, inlineVolume: true },
		);

		// Set the volume to the Queue volume
		resource.volume?.setVolumeLogarithmic(songQueue.volume / 100);
		songQueue.audioResource = resource;

		// Sometimes the player is not created
		// Skip to the next song if that's the case
		if (!songQueue.player) {
			await playNextSong(guildId);
			return;
		}

		// Play the Audio
		songQueue.player.play(songQueue.audioResource);
	}
	catch (e) {
		/**
		 * Only display error if it's not related to
		 * a seek number being greater than song duration
		 */
		if (!seek || seek < song.durationSec) {
			console.error(e);
		}
		await playNextSong(guildId);
		return;
	}
};

/**
 * Function for creating a new Queue
 * and connecting to a voice channel
 * @param {VoiceBasedChannel} voice - Channel to play audio in
 * @param {TextBasedChannel} text - Channel to send messages to
 * @return {Promise<Queue>} Created Queue
 */
export const createQueue = async (
	voice: VoiceBasedChannel,
	text: TextChannel,
): Promise<Queue> => {
	try {
		// Join the voice channel
		const connection = joinVoiceChannel({
			channelId: voice.id,
			guildId: voice.guild.id,
			adapterCreator:
				voice.guild.voiceAdapterCreator as DiscordGatewayAdapterCreator,
		});

		if (!connection) {
			throw new Error(errorMessages.VOICE_CONNECTION_ERROR);
		}

		// TODO: Delete songsPlayed
		return new Queue({
			voiceChannel: voice,
			textChannel: text,
			connection: connection,
			songs: [] as Song[],
			songsPlayed: 0,
			stopped: false,
			loop: LoopState.Disabled,
			loopCounter: 0,
			songIndex: 0,
			volume: 100,
		});
	}
	catch (e) {
		queue.delete(guildId);
		throw e;
	}
};

/**
 * Function for searching a song in YouTube
 * @param {string} query Song to search for
 * @return {Song} Found song from YouTube
 */
export const searchSong = async (query: string): Promise<Song> => {
	const video: YouTubeVideo = (await search(query, { limit: 1 }))[0];

	return new Song({
		title: video?.title ?? 'Untitled',
		url: video?.url ?? errorMessages.NO_VIDEO_RESULT,
		duration: video?.durationRaw ?? '',
		durationSec: video?.durationInSec ?? 0,
		requester: author,
	});
};

/**
 * Function for handling a Spotify Link
 * @param {string} url Url of the song
 * @param {Queue} songQueue The queue of the server
 * @param {EmbedBuilder} response The Embed response
 */
const handleSpotify = async (url: string, songQueue: Queue, response: EmbedBuilder): Promise<void> => {
	try {
		// Refresh Spotify Token
		if (isExpired()) await refreshToken();

		/**
		 * Distinction between album and playlist is
		 * unnecessary for searching the song on youtube
		 */
		if (spValidate(url) == 'track') await searchSpotifySong(url, songQueue, response);
		else await searchSpotifyPlaylist(url, songQueue, response);
	}
	catch (e) {
		console.error(e);
		response.setDescription('Error playing.');
		await playNextSong(guildId);
	}
};

/**
 * Function for handling a song in Spotify
 * @param {string} url Url of the song
 * @param {Queue} songQueue The queue of the server
 * @param {EmbedBuilder} response The Embed response
 */
const searchSpotifySong = async (url: string, songQueue: Queue, response: EmbedBuilder): Promise<void> => {
	const spData = await spotify(url) as SpotifyTrack;

	/**
	 * Search song on Youtube
	 * <Song-Title> <Artist1> <Artist2>...
	 */
	const song = await searchSong(`${spData.name} ${spData.artists.map((artist) => artist.name).join(' ')}`,
	);

	if (song.url.includes(errorMessages.NO_VIDEO_RESULT)) {
		response.setDescription(errorMessages.NO_VIDEO_RESULT);
		return;
	}

	songQueue.songs.push(song);
	response.setDescription(
		`Queued [${song.title}](${song.url}) (${song.duration}) [${author}]`,
	);
};

/**
 * Function for handling a playlist in Spotify
 * @param {string} url Url of the song
 * @param {Queue} songQueue The queue of the server
 * @param {EmbedBuilder} response The Embed response
 */
const searchSpotifyPlaylist = async (url: string, songQueue: Queue, response: EmbedBuilder): Promise<void> => {
	let song: Song;

	const spData = await spotify(url) as SpotifyAlbum;
	await spData.fetch();
	const tracks: SpotifyTrack[] = await spData.all_tracks();

	for (const track of tracks) {
		try {
			const dur: number = track.durationInSec;
			const durMin: number = Math.floor(dur / 60);
			const durSec = (dur % 60).toString().padStart(2, '0');
			const durFormat = `${durMin}:${durSec}`;

			song = new Song({
				title: `${track.name} - ${track.artists.map(
					(artist) => artist.name).join(' ')}`,
				url: track.url,
				duration: durFormat,
				durationSec: dur,
				requester: author,
				spotify: true,
			});
		}
		catch (e) {
			/**
			 * Most errors are caused by erroneous search
			 * or song visibility, so we ignore them
			 */
			console.error(e);
			continue;
		}
		songQueue.songs.push(song);
	}

	response.setDescription(
		`Added **${tracks.length}** songs from **${spData.name}**! :thumbsup:`);
};

/**
 * Function for handling a YouTube Link
 * @param {string} url Url of the song
 * @param {Queue} songQueue The queue of the server
 * @param {EmbedBuilder} response The Embed response
 */
const handleYoutube = async (url: string, songQueue: Queue, response: EmbedBuilder): Promise<void> => {
	const videoType = ytValidate(url);

	if (videoType == 'playlist') await searchYoutubePlaylist(url, songQueue, response);
	else await searchYoutubeSong(url, songQueue, response);
};

/**
 * Function for handling a song in YouTube
 * @param {string} url Url of the song
 * @param {Queue} songQueue The queue of the server
 * @param {EmbedBuilder} response The Embed response
 */
const searchYoutubeSong = async (url: string, songQueue: Queue, response: EmbedBuilder): Promise<void> => {
	let song: Song;

	try {
		const video: InfoData = await videoInfo(url);
		const details: YouTubeVideo = video.video_details;

		song = {
			title: details.title ?? 'Untitled',
			url: details.url,
			duration: details.durationRaw,
			durationSec: details.durationInSec,
			requester: author,
		};

		response.setDescription(
			`Queued [${song.title}](${song.url}) (${song.duration})` +
			` [${author}]`);
	}
	catch (err) {
		response.setDescription(errorMessages.NO_VIDEO_RESULT);
		console.error(err);
		return;
	}

	songQueue.songs.push(song);
};

/**
 * Function for handling a playlist in YouTube
 * @param {string} url Url of the song
 * @param {Queue} songQueue The queue of the server
 * @param {EmbedBuilder} response The Embed response
 */
const searchYoutubePlaylist = async (url: string, songQueue: Queue, response: EmbedBuilder): Promise<void> => {
	let song: Song;

	// Incomplete is true to ignore private or deleted videos
	const playlist: YouTubePlayList = await playlistInfo(url, { incomplete: true });
	await playlist.fetch();

	const videos: YouTubeVideo[] = await playlist.all_videos();

	for (const video of videos) {
		try {
			if (!video.url) continue;

			song = {
				title: video.title ?? 'Untitled',
				url: video.url,
				duration: video.durationRaw,
				durationSec: video.durationInSec,
				requester: author,
			};
			songQueue.songs.push(song);
		}
		catch (e) {
			/**
			 * Most errors are caused by erroneous search
			 * or song visibility, so we ignore them
			 */
			console.error(e);
			continue;
		}
	}

	response.setDescription(
		`Added **${playlist.total_videos}** videos to the queue!` +
		' :thumbsup:');
};

/**
 * Function for handling an url
 * @param {string} url Url of the song
 * @param {SuperInteraction} interaction Interaction of the message
 */
const handleUrl = async (url: string, interaction: SuperInteraction): Promise<void> => {
	const songQueue = queue.get(guildId)!;
	const response = new EmbedBuilder()
		.setColor(randomColor())
		.setDescription('Empty');

	// Search the song on youtube if it's not a link
	if (!url.startsWith('https')) {
		await searchQuery(url, songQueue, response);
	}
	else if (url.includes('spotify')) {
		await handleSpotify(url, songQueue, response);
	}
	else {
		/**
		 * Delete superfluous info, such as the playlist the url comes
		 * from when trying to play a video instead of the playlist
		 */
		const videoFromList = url.includes('&list') && url.includes('&index');
		if (videoFromList) url = url.substring(0, url.indexOf('&list'));

		await handleYoutube(url, songQueue, response);
	}

	await interaction.editReply({ embeds: [response] });
};

/**
 * Function for handling a non-url search
 * @param {string} url Url of the song
 * @param {Queue} songQueue The queue of the server
 * @param {EmbedBuilder} response The Embed response
 */
const searchQuery = async (url: string, songQueue: Queue, response: EmbedBuilder): Promise<void> => {
	const song = await searchSong(url);
	if (song.url.includes(errorMessages.NO_VIDEO_RESULT)) {
		response.setDescription(errorMessages.NO_VIDEO_RESULT);
		return;
	}

	songQueue.songs.push(song);
	response.setDescription(
		`Queued [${song.title}](${song.url}) (${song.duration})` +
		` [${author}]`);
	return;
};
