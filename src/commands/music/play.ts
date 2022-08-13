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
	stream,
} from 'play-dl';

import { Command } from '../../structures/Command';
import { Queue } from '../../structures/Queue';
import { queue, SuperClient } from '../../structures/Client';
import { LoopState } from '../../typings/Queue';
import { playNextSong } from '../../events/player/stateChange';
import { Song } from '../../structures/Song';
import { SongPlayer } from 'src/typings/SongPlayer';

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
			response.setDescription(`You need to be in a voice channel to execute this command ${author}!`);
			await interaction.followUp({ embeds: [response] });
			return;
		}

		const voiceChannel =
			interaction.guild?.voiceStates.cache.get(author.id)?.channel;

		if (!voiceChannel) {
			interaction.followUp('Error while getting voice channel.');
			return;
		}
		if (!interaction.channel) {
			interaction.followUp('Error while getting text channel.');
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
				interaction.followUp('Error while creating queue');
				console.error(e);
				return;
			}
		}

		const songQueue = queue.get(guildId);
		if (!songQueue) {
			interaction.followUp('Error while creating queue.');
			return;
		}

		let song: Song;
		let wasPlaylist = false;
		const first = (songQueue.songs.length) ? false : true;

		let url = args.getString('query', true);

		if (url.includes('spotify')) {
			if (isExpired()) await refreshToken();
			let spData: SpotifyTrack | SpotifyAlbum;

			try {
				switch (spValidate(url)) {
					case 'track':
						spData = await spotify(url) as SpotifyTrack;

						// Search song on Youtube
						try {
							/* eslint-disable-next-line max-len */
							song = await searchSong(`${spData.name} ${spData.artists.map((artist) => artist.name).join(' ')}`);
						}
						catch (e) {
							await interaction.followUp('No video result found.');
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

						for (const track of tracks) {
							try {
								song =
									await searchSong(`${track.name} ${track.artists.map(
										(artist) => artist.name).join(' ')}`);
							}
							catch (e) {
								continue;
							}
							songQueue.songs.push(song);
							songQueue.fullQueue.push(song);
						}

						/* eslint-disable-next-line max-len */
						response.setDescription(`:thumbsup: Added **${tracks.length}** songs to the queue!`);
						await interaction.followUp({ embeds: [response] });

						wasPlaylist = true;
						break;
					default:
						interaction.followUp('This should never happen.');
						return;
				}
			}
			catch (e) {
				console.error(e);
				await interaction.followUp('Error playing.');
				await playNextSong(guildId);
				return;
			}
		}
		else {
			switch (ytValidate(url)) {
				case 'playlist':
					const playlist = await playlistInfo(url, { incomplete: true });
					await playlist.fetch();

					const videos = await playlist.all_videos();

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

					/* eslint-disable-next-line max-len */
					response.setDescription(`:thumbsup: Added **${playlist.total_videos}** videos to the queue!`);
					await interaction.followUp({ embeds: [response] });

					wasPlaylist = true;
					break;
				case 'video':
				case 'search':
					// Search gets handled inside video due to ytValidate
					// returning 'video' instead of 'search' sometimes
					if (!url.startsWith('https')) {
						try {
							song = await searchSong(url);
						}
						catch (e) {
							await interaction.followUp('No video result found.');
							return;
						}

						songQueue.songs.push(song);
						songQueue.fullQueue.push(song);
						break;
					}

					if (url.includes('list')) url = url.substring(0, url.indexOf('list'));

					const video = await videoInfo(url);
					song = {
						title: video.video_details.title ?? 'Untitled',
						url: video.video_details.url,
						duration: video.video_details.durationRaw,
						durationSec: video.video_details.durationInSec,
					};

					if (!song.url) {
						await interaction.followUp('No video result found.');
						return;
					}
					if (!song.title) {
						song.title = '';
					}

					songQueue.songs.push(song);
					songQueue.fullQueue.push(song);
					break;
				default:
					await interaction.followUp('This should never happen 2.');
					await playNextSong(guildId);
					return;
			}
		}

		if (first) {
			await videoPlayer(guildId, songQueue.songs[0]);
			initiateEvents(guildId);
		}

		if (!wasPlaylist) {
			/* eslint-disable-next-line max-len */
			response.setDescription(`Queued [${songQueue.songs.at(-1)?.title}](${songQueue.songs.at(-1)?.url}) (${songQueue.songs.at(-1)?.duration}) [${author}]`);
			await interaction.followUp({ embeds: [response] });
		}
	},
});

/**
 * Initiate events on the audio player
 * @param {string} id The guild id of the player
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
	if (!song.title) {
		song.title = '';
	}

	try {
		// Create Player
		if (!songQueue.player) {
			const player = createAudioPlayer({
				behaviors: { noSubscriber: NoSubscriberBehavior.Play },
			}) as SongPlayer;
			songQueue.player = player;
		}

		// Create Player Resources
		const s = await stream(song.url, { seek: seek });
		const resource = createAudioResource(s.stream, { inputType: s.type });
		songQueue.audioResource = resource;

		// Play the Audio
		if (!songQueue.connection) {
			queue.delete(id);
			return;
		}
		songQueue.connection.subscribe(songQueue.player);
		songQueue.player.play(resource);
	}
	catch (e) {
		if ((!seek || seek && seek < song.durationSec)) {
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
 * @return {Promise<Queue>} - Created Queue
 */
export const createQueue = async (
	voice: VoiceBasedChannel,
	text: TextBasedChannel,
): Promise<Queue> => {
	try {
		const connection = joinVoiceChannel({
			channelId: voice.id,
			guildId: voice.guild.id,
			adapterCreator:
				voice.guild.voiceAdapterCreator as DiscordGatewayAdapterCreator,
		});

		if (!connection) {
			throw new Error('Couldn\'t connect to voice channel.');
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
 * @return {Song} - Found song from YouTube
 */
const searchSong = async (query: string): Promise<Song> => {
	const ytInfo = await search(query, { limit: 1 });
	if (!ytInfo[0] || !ytInfo[0].url) {
		throw new Error('Couldn\'t find the requested song.');
	}

	return new Song({
		title: ytInfo[0].title ?? 'Untitled',
		url: ytInfo[0].url,
		duration: ytInfo[0].durationRaw,
		durationSec: ytInfo[0].durationInSec,
	});
};
