import {
	ApplicationCommandType,
	ApplicationCommandOptionType,
	EmbedBuilder,
	TextBasedChannel,
	User,
	VoiceBasedChannel,
} from 'discord.js';
import {
	createAudioPlayer,
	createAudioResource,
	DiscordGatewayAdapterCreator,
	joinVoiceChannel,
	NoSubscriberBehavior,
} from '@discordjs/voice';
import {
	is_expired as isExpired,
	playlist_info as playlistInfo,
	video_info as videoInfo,
	yt_validate as ytValidate,
	sp_validate as spValidate,
	refreshToken,
	search,
	spotify,
	SpotifyAlbum,
	SpotifyTrack,
	YouTubeVideo,
	YouTubePlayList,
	stream,
	InfoData,
} from 'play-dl';

import { Command } from '../../structures/Command';
import { Queue } from '../../structures/Queue';
import { queue, SuperClient } from '../../structures/Client';
import { LoopState } from '../../typings/Queue';
import { playNextSong } from '../../events/player/stateChange';
import { Song } from '../../structures/Song';
import { SongPlayer } from '../../typings/SongPlayer';

/**
 * @type {string} - The id of the current guild
 */
export let guildId: string = '';

/**
 * @type {TextBasedChannel} - The channel to send messages to
 */
export let channel: TextBasedChannel;

/**
 * @type {User} - The user of the interaction
 */
export let author: User;

/**
 * @type {SuperClient} - Discord Client
 */
let bot: SuperClient;

const NO_VIDEO_RESULT_MESSAGE = 'No video result found.';
const NO_VOICE_CHANNEL_MESSAGE =
	'You need to be in a voice channel to execute this command.';
const VOICE_CHANNEL_NOT_FOUND = 'Error while getting voice channel.';
const TEXT_CHANNEL_NOT_FOUND = 'Error while getting text channel.';
const BAD_VOICE_CONNECTION = 'Error while joining the channel.';
const QUEUE_NOT_FOUND = 'Error while getting the server queue.';


/**
 * Searches a song with a query on Spotify or YouTube
 * and adds it to the queue
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
		const response = new EmbedBuilder()
			.setColor('#15b500')
			.setDescription('Empty');

		if (!interaction.member.voice.channel) {
			/* eslint-disable-next-line max-len */
			response.setDescription(`${NO_VOICE_CHANNEL_MESSAGE} [${author}]`);
			await interaction.editReply({ embeds: [response] });
			return;
		}

		const voiceChannel =
			interaction.guild?.voiceStates.cache.get(author.id)?.channel;

		if (!voiceChannel) {
			interaction.editReply(VOICE_CHANNEL_NOT_FOUND);
			return;
		}
		if (!interaction.channel) {
			interaction.editReply(TEXT_CHANNEL_NOT_FOUND);
			return;
		}

		guildId = interaction.commandGuildId!;
		channel = interaction.channel;

		if (!queue.get(guildId)) {
			try {
				queue.set(guildId,
					await createQueue(voiceChannel, channel));
			}
			catch (e) {
				interaction.editReply(BAD_VOICE_CONNECTION);
				console.error(e);
				return;
			}
		}

		const songQueue = queue.get(guildId);
		if (!songQueue) {
			interaction.editReply(QUEUE_NOT_FOUND);
			return;
		}

		let song: Song;
		let wasPlaylist = false;
		const first = (songQueue.songs.length) ? false : true;

		let url = args.getString('query', true);

		if (url.includes('spotify')) {
			/**
			 * Refresh the Spotify Token
			 */
			if (isExpired()) await refreshToken();
			let spData: SpotifyTrack | SpotifyAlbum;

			try {
				switch (spValidate(url)) {
					case 'track':
						spData = await spotify(url) as SpotifyTrack;

						// Search song on Youtube
						// <Song-Title> <Artist1> <Artist2>...
						try {
							/* eslint-disable-next-line max-len */
							song = await searchSong(`${spData.name} ${spData.artists.map((artist) => artist.name).join(' ')}`);
							if (song.url.includes(NO_VIDEO_RESULT_MESSAGE)) {
								throw new Error(NO_VIDEO_RESULT_MESSAGE);
							}
						}
						catch (e) {
							await interaction.editReply(NO_VIDEO_RESULT_MESSAGE);
							console.error(e);
							return;
						}

						songQueue.songs.push(song);
						songQueue.fullQueue.push(song);
						break;
					case 'playlist':
					case 'album':
						// Distinction between album and playlist is
						// unnecessary for searching the song on youtube
						spData = await spotify(url) as SpotifyAlbum;
						await spData.fetch();
						const tracks = await spData.all_tracks();

						// TODO: it might be faster to only search each track on yt when
						// they are going to be played, instead of searching them all at
						// the same time
						for (const track of tracks) {
							try {
								song =
									await searchSong(`${track.name} ${track.artists.map(
										(artist) => artist.name).join(' ')}`);

								if (song.url.includes(NO_VIDEO_RESULT_MESSAGE)) {
									throw new Error(NO_VIDEO_RESULT_MESSAGE);
								}
							}
							catch (e) {
								// Most errors are caused by erroneous search results,
								// or song visibility, so we ignore it
								console.error(e);
								continue;
							}
							songQueue.songs.push(song);
							songQueue.fullQueue.push(song);
						}

						/* eslint-disable-next-line max-len */
						response.setDescription(`:thumbsup: Added **${tracks.length}** songs to the queue!`);
						await interaction.editReply({ embeds: [response] });

						wasPlaylist = true;
						break;
					default:
						interaction.editReply('Error while validating Spotify link.');
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
		}
		else {
			switch (ytValidate(url)) {
				case 'playlist':
					// Incomplete is true to ignore private or deleted videos
					const playlist: YouTubePlayList =
						await playlistInfo(url, { incomplete: true });
					await playlist.fetch();

					const videos: YouTubeVideo[] = await playlist.all_videos();

					for (const video of videos) {
						if (!video.url) continue;

						song = {
							title: video.title ?? 'Untitled',
							url: video.url,
							duration: video.durationRaw,
							durationSec: video.durationInSec,
						};
						songQueue.songs.push(song);
						songQueue.fullQueue.push(song);
					}

					response.setDescription(
						`Added **${playlist.total_videos}** videos to the queue!` +
						' :thumbsup:');
					await interaction.editReply({ embeds: [response] });

					wasPlaylist = true;
					break;
				case 'search':
				// Search gets handled inside video due to ytValidate
				// returning 'video' instead of 'search' sometimes
				case 'video':
					// Search the song on youtube
					if (!url.startsWith('https')) {
						try {
							song = await searchSong(url);
							if (song.url.includes(NO_VIDEO_RESULT_MESSAGE)) {
								throw new Error(NO_VIDEO_RESULT_MESSAGE);
							}
						}
						catch (e) {
							await interaction.editReply(NO_VIDEO_RESULT_MESSAGE);
							console.error(e);
							return;
						}

						songQueue.songs.push(song);
						songQueue.fullQueue.push(song);
						break;
					}

					// Delete superfluous info, such as the playlist the url comes from
					if (url.includes('&list')) {
						url = url.substring(0, url.indexOf('&list'));
					}

					try {
						const video: InfoData = await videoInfo(url);
						const details: YouTubeVideo = video.video_details;

						song = {
							title: details.title ?? 'Untitled',
							url: details.url,
							duration: details.durationRaw,
							durationSec: details.durationInSec,
						};
					}
					catch (err) {
						await interaction.editReply(NO_VIDEO_RESULT_MESSAGE);
						console.error(err);
						return;
					}

					songQueue.songs.push(song);
					songQueue.fullQueue.push(song);
					break;
				default:
					interaction.editReply('Error while validating Youtube link.');
					await playNextSong(guildId);
					return;
			}
		}

		if (first) {
			// Start playback and start listening for player events
			await videoPlayer(guildId, songQueue.songs[0]);
			initiateEvents(guildId);
		}

		if (!wasPlaylist) {
			/* eslint-disable-next-line max-len */
			response.setDescription(`Queued [${songQueue.songs.at(-1)?.title}](${songQueue.songs.at(-1)?.url}) (${songQueue.songs.at(-1)?.duration}) [${author}]`);
			await interaction.editReply({ embeds: [response] });
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
	text: TextBasedChannel,
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
			fullQueue: [] as Song[],
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
 * @param {string} query - Song to search for
 * @return {Song} Found song from YouTube
 */
export const searchSong = async (query: string): Promise<Song> => {
	let video: YouTubeVideo;
	try {
		video = (await search(query, { limit: 1 }))[0];
	}
	catch (err) {
		console.error(err);
		return new Song({
			title: 'Untitled',
			url: NO_VIDEO_RESULT_MESSAGE,
			duration: '',
			durationSec: 0,
		});
	}

	return new Song({
		title: video.title ?? 'Untitled',
		url: video.url,
		duration: video.durationRaw,
		durationSec: video.durationInSec,
	});
};
