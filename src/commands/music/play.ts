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
	TextChannel,
	User,
	type VoiceBasedChannel,
} from 'discord.js';
import {
	is_expired as isExpired,
	playlist_info as playlistInfo,
	refreshToken,
	search,
	spotify,
	SpotifyAlbum,
	SpotifyTrack,
	sp_validate as spValidate,
	stream,
	video_info as videoInfo,
	YouTubePlayList,
	YouTubeVideo,
	yt_validate as ytValidate,
	type InfoData,
} from 'play-dl';

import { playNextSong } from '../../events/player/stateChange';
import { queue, SuperClient } from '../../structures/Client';
import { Command } from '../../structures/Command';
import { Queue } from '../../structures/Queue';
import { Song } from '../../structures/Song';
import type { SuperInteraction } from '../../typings/Command';
import { LoopState } from '../../typings/Queue';
import type { SongPlayer } from '../../typings/SongPlayer';

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

/* ----------------------------- Error Messages ----------------------------- */
const NO_VIDEO_RESULT_MESSAGE = 'No video result found.';
const NO_VOICE_CHANNEL_MESSAGE =
	'You need to be in a voice channel to execute this command.';
const VOICE_CHANNEL_NOT_FOUND = 'Error while getting voice channel.';
const TEXT_CHANNEL_NOT_FOUND = 'Error while getting text channel.';
const BAD_VOICE_CONNECTION = 'Error while joining the channel.';
const QUEUE_NOT_FOUND = 'Error while getting the server queue.';
const SPOTIFY_VALIDATION_ERROR = 'Error while validating Spotify link.';
const YOUTUBE_VALIDATION_ERROR = 'Error while validating YouTube link.';

/**
 * Searches a song with a query on Spotify or YouTube
 * and adds it to the queue
 */
export default new Command({
	/* ---------------------------- Command Options --------------------------- */
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

		/* ------------------------- Basic Error Handling ------------------------- */
		if (!interaction.member.voice.channel) {
			await interaction.editReply(`${NO_VOICE_CHANNEL_MESSAGE} [${author}]`);
			return;
		}

		const voiceChannel =
			interaction.guild?.voiceStates.cache.get(author.id)?.channel;

		if (!voiceChannel) {
			await interaction.editReply(VOICE_CHANNEL_NOT_FOUND);
			return;
		}
		if (!interaction.channel) {
			await interaction.editReply(TEXT_CHANNEL_NOT_FOUND);
			return;
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
				await interaction.editReply(BAD_VOICE_CONNECTION);
				console.error(e);
				return;
			}
		}

		const songQueue = queue.get(guildId);
		if (!songQueue) {
			await interaction.editReply(QUEUE_NOT_FOUND);
			return;
		}

		const first = (songQueue.songs.length) ? false : true;

		const url = args.getString('query', true);

		if (url.includes('spotify')) {
			await handleSpotify(url, interaction);
		}
		else {
			await handleYoutube(url, interaction);
		}

		if (first) {
			// Start playback
			await videoPlayer(guildId, songQueue.songs[0]);

			// Start listening for player events
			initiateEvents(guildId);
		}
	},
});

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

	delete songQueue.audioResource;

	try {
		// Create Player
		if (!songQueue.player) {
			const player = createAudioPlayer({
				behaviors: { noSubscriber: NoSubscriberBehavior.Pause },
			}) as SongPlayer;
			songQueue.player = player;

			// Subscribe the player to the voice connection
			if (!songQueue.connection) {
				songQueue.songs = [];
				playNextSong(id);
				return;
			}
			songQueue.connection.subscribe(songQueue.player);
		}

		// Create Player Resources
		if (song.spotify) {
			song = await searchSong(song.title);

			if (song.url.includes(NO_VIDEO_RESULT_MESSAGE)) {
				throw new Error(NO_VIDEO_RESULT_MESSAGE);
			}
		}

		const songStream = await stream(song.url, { seek: seek });
		const resource = createAudioResource(songStream.stream,
			{ inputType: songStream.type, inlineVolume: true },
		);
		resource.volume?.setVolumeLogarithmic(songQueue.volume / 100);
		songQueue.audioResource = resource;

		// Play the Audio
		songQueue.player.play(songQueue.audioResource);
	}
	catch (e) {
		// Only display error if it's not related to
		// a seek number being greater than song duration
		if ((!seek || seek < song.durationSec)) {
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
			throw new Error(BAD_VOICE_CONNECTION);
		}

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
		console.error(e);
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
		url: video?.url ?? NO_VIDEO_RESULT_MESSAGE,
		duration: video?.durationRaw ?? '',
		durationSec: video?.durationInSec ?? 0,
		requester: author,
	});
};

/**
 * Function for handling a song in Spotify
 * @param {url} url Url of the song
 * @param {SuperInteraction} interaction Search Interaction
 */
const handleSpotify = async (url: string, interaction: SuperInteraction): Promise<void> => {
	const songQueue = queue.get(guildId)!;
	const response = new EmbedBuilder()
		.setColor('#15b500')
		.setDescription('Empty');
	try {
		/**
		 * Refresh Spotify Token
		 */
		if (isExpired()) await refreshToken();

		let spData: SpotifyTrack | SpotifyAlbum;
		let song: Song;

		switch (spValidate(url)) {
			case 'track':
				spData = await spotify(url) as SpotifyTrack;

				// Search song on Youtube
				// <Song-Title> <Artist1> <Artist2>...
				song = await searchSong(`${spData.name} ${spData.artists.map(
					(artist) => artist.name).join(' ')}`,
				);

				if (song.url.includes(NO_VIDEO_RESULT_MESSAGE)) {
					await interaction.editReply(NO_VIDEO_RESULT_MESSAGE);
					return;
				}

				songQueue.songs.push(song);
				response.setDescription(
					`Queued [${song.title}](${song.url}) (${song.duration})` +
					` [${author}]`);
				await interaction.editReply({ embeds: [response] });
				break;
			case 'playlist':
			case 'album':
				// Distinction between album and playlist is
				// unnecessary for searching the song on youtube
				spData = await spotify(url) as SpotifyAlbum;
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
								(artist) => artist.name).join(', ')}`,
							url: track.url,
							duration: durFormat,
							durationSec: dur,
							requester: author,
							spotify: true,
						});
					}
					catch (e) {
						// Most errors are caused by erroneous search results,
						// or song visibility, so we ignore it
						console.error(e);
						continue;
					}
					songQueue.songs.push(song);
				}

				response.setDescription(
					`Added **${tracks.length}** songs from **${spData.name}**! :thumbsup:`);
				await interaction.editReply({ embeds: [response] });
				break;
			default:
				await interaction.editReply(SPOTIFY_VALIDATION_ERROR);
				await playNextSong(guildId);
				return;
		}
	}
	catch (e) {
		console.error(e);
		await interaction.editReply('Error playing.');
		await playNextSong(guildId);
		return;
	}
};

/**
 * Function for handling a song in YouTube
 * @param {url} url Url of the song
 * @param {SuperInteraction} interaction Search Interaction
 */
const handleYoutube = async (url: string, interaction: SuperInteraction): Promise<void> => {
	const songQueue = queue.get(guildId)!;
	const response = new EmbedBuilder()
		.setColor('#15b500')
		.setDescription('Empty');
	let song: Song;

	/**
	 * Delete superfluous info, such as the playlist the url comes from
	 * when trying to play a video instead of the playlist
	 */
	const videoFromList = url.includes('&list') && url.includes('&index');
	if (videoFromList) {
		url = url.substring(0, url.indexOf('&list'));
	}

	switch (ytValidate(url)) {
		case 'playlist':
			// Incomplete is true to ignore private or deleted videos
			const playlist: YouTubePlayList =
				await playlistInfo(url, { incomplete: true });
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
					// Most errors are caused by erroneous search results,
					// or song visibility, so we ignore it
					console.error(e);
					continue;
				}
			}

			response.setDescription(
				`Added **${playlist.total_videos}** videos to the queue!` +
				' :thumbsup:');
			await interaction.editReply({ embeds: [response] });
			break;
		case 'search':
		// Search gets handled inside video due to ytValidate
		// returning 'video' instead of 'search' sometimes
		case 'video':
			// Search the song on youtube
			if (!url.startsWith('https')) {
				song = await searchSong(url);
				if (song.url.includes(NO_VIDEO_RESULT_MESSAGE)) {
					await interaction.editReply(NO_VIDEO_RESULT_MESSAGE);
					return;
				}

				songQueue.songs.push(song);
				response.setDescription(
					`Queued [${song.title}](${song.url}) (${song.duration})` +
					` [${author}]`);

				await interaction.editReply({ embeds: [response] });
				break;
			}

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

				await interaction.editReply({ embeds: [response] });
			}
			catch (err) {
				await interaction.editReply(NO_VIDEO_RESULT_MESSAGE);
				console.error(err);
				return;
			}

			songQueue.songs.push(song);
			break;
		default:
			await interaction.editReply(YOUTUBE_VALIDATION_ERROR);
			await playNextSong(guildId);
			return;
	}
};
