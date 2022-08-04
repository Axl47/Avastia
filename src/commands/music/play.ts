import { createAudioPlayer, createAudioResource, joinVoiceChannel, NoSubscriberBehavior, DiscordGatewayAdapterCreator, VoiceConnection } from "@discordjs/voice";
import { is_expired, refreshToken, spotify, SpotifyTrack, SpotifyAlbum, playlist_info, video_info, yt_validate, sp_validate, stream, search } from "play-dl"
import { MessageEmbed, TextBasedChannel, User, VoiceBasedChannel } from "discord.js";
import { playNextSong } from "../../events/player/stateChange";
import { Command } from "../../structures/Command";
import { SuperInteraction } from "../../typings/Command";
import { queue } from "../../structures/Client";
import { Song } from "../../structures/Song";
import { Queue } from "../../structures/Queue";
import { client } from "../../main";

export let guildId = "";
export let channel: TextBasedChannel;
export let author: User;

export default new Command({
  name: 'play',
  description: 'Plays a song',
  options: [
    {
      name: 'query',
      description: 'Search a song',
      type: 'STRING',
      required: true,
    },
  ],
  run: async ({ interaction }) => {
    author = interaction.user;
    const response = new MessageEmbed().setColor("#15b500").setDescription('');

    if (!interaction.member.voice.channel) {
      response.setDescription(`You need to be in a voice channel to execute this command ${author}!`);
      return await interaction.followUp({ embeds: [response] });
    }

    const voiceChannel = interaction.guild?.voiceStates.cache.get(author.id)?.channel;

    if (!voiceChannel) return interaction.followUp("Error while getting voice channel.");
    if (!interaction.channel) return interaction.followUp("Error while getting text channel.");

    guildId = interaction.member.guild.id;
    channel = interaction.channel;

    if (!queue.get(guildId)) {
      createQueue(voiceChannel, channel, interaction);
    }

    const songQueue = queue.get(guildId);

    let song: Song;
    let wasPlaylist = false;
    let first = (songQueue.songs.length) ? false : true;

    let url = interaction.options.getString('query', true);

    if (url.includes("spotify")) {
      if (is_expired()) await refreshToken();
      let sp_data: SpotifyTrack | SpotifyAlbum;

      try {
        switch (sp_validate(url)) {
          case 'track':
            sp_data = await spotify(url) as SpotifyTrack;

            // Search song on Youtube
            song = await searchSong(`${sp_data.name} ${sp_data.artists.map(artist => artist.name).join(" ")}`);
            if (!song.url) return await interaction.followUp("No video result found.");

            songQueue.songs.push(song);
            break;
          case 'playlist':
          case 'album':
            // Distinction between album and playlist is
            // unnecessary for searching the song on youtube
            sp_data = await spotify(url) as SpotifyAlbum;
            await sp_data.fetch();
            const tracks = await sp_data.all_tracks();

            for (const track of tracks) {
              song = await searchSong(`${track.name} ${track.artists.map(artist => artist.name).join(" ")}`);
              if (!song.url) continue;
              songQueue.songs.push(song);
            }

            response.setDescription(`:thumbsup: Added **${tracks.length}** songs to the queue!`);
            await interaction.followUp({ embeds: [response] });

            wasPlaylist = true;
            break;
          default:
            return interaction.followUp("This should never happen.");
        }
      } catch (e) {
        await interaction.followUp("Error playing.");
        return console.error(e);
      }

    } else {
      switch (yt_validate(url)) {
        case 'playlist':
          const playlist = await playlist_info(url, { incomplete: true });
          await playlist.fetch();

          const videos = await playlist.all_videos();

          for (const video of videos) {
            if (!video.url) continue;

            song = {
              title: video.title ?? "Untitled",
              url: video.url,
              duration: video.durationRaw,
              durationSec: video.durationInSec,
            };
            songQueue.songs.push(song);
          }

          response.setDescription(`:thumbsup: Added **${playlist.total_videos}** videos to the queue!`);
          await interaction.followUp({ embeds: [response] });

          wasPlaylist = true;
          break;
        case 'video':
        case 'search':
          // Search gets handled inside video due to yt_validate
          // returning 'video' instead of 'search' sometimes
          if (!url.startsWith("https")) {
            song = await searchSong(url);
            if (!song.url) return await interaction.followUp("No video result found.");

            songQueue.songs.push(song);
            break;
          }

          if (url.includes("list")) url = url.substring(0, url.indexOf("list"));

          const video = await video_info(url);
          song = {
            title: video.video_details.title ?? "Untitled",
            url: video.video_details.url,
            duration: video.video_details.durationRaw,
            durationSec: video.video_details.durationInSec,
          };

          if (!song.url) return await interaction.followUp("No video result found.");
          if (!song.title) song.title = '';

          songQueue.songs.push(song);
          break;
        default:
          return interaction.followUp("This should never happen 2.");
      }
    }

    if (first) {
      await videoPlayer(guildId, songQueue.songs[0]);
      initiateEvents(guildId);
    }

    if (!wasPlaylist) {
      response.setDescription(`Queued [${songQueue.songs.at(-1).title}](${songQueue.songs.at(-1).url}) [${author}]`);
      await interaction.followUp({ embeds: [response] });
    }
  }
});

export const initiateEvents = (guildId: string): void => {
  client.playerEvents(guildId);
}

// Function for playing audio
export const videoPlayer = async (guildId: string, song: Song, seek?: number): Promise<void> => {
  // Get the server queue
  const songQueue = queue.get(guildId);

  // Error Handling
  if (!song) {
    playNextSong()
    return;
  };
  if (!song.title) song.title = "";

  try {
    // Create Player
    if (!songQueue.player) {
      const player = createAudioPlayer({
        behaviors: { noSubscriber: NoSubscriberBehavior.Play },
      });
      songQueue.player = player;
    }

    // Create Player Resources
    let s = await stream(song.url, { seek: seek });
    let resource = createAudioResource(s.stream, { inputType: s.type });

    // Play the Audio
    await songQueue.connection.subscribe(songQueue.player);
    await songQueue.player.play(resource);
    if (!songQueue.connection) {
      songQueue.player.stop();
      queue.delete(guildId);
      return;
    }
  } catch (e) {
    if ((seek && seek < song.durationSec) || !seek) console.error(e);
    playNextSong();
    return;
  }
};

export const createQueue = async (voice: VoiceBasedChannel, text: TextBasedChannel, interaction: SuperInteraction): Promise<void> => {
  try {
    const connection = joinVoiceChannel({
      channelId: voice.id,
      guildId: guildId,
      adapterCreator: interaction.member.guild.voiceAdapterCreator as DiscordGatewayAdapterCreator,
    });

    const queueConstructor = new Queue({
      voiceChannel: voice,
      textChannel: text,
      connection: connection,
      player: null,
      songs: [] as Song[],
      stopped: false,
      loop: false,
      loopCounter: 0,
    });;

    // Set the queue on the global queue
    queue.set(guildId, queueConstructor);
  } catch (e) {
    queue.delete(guildId);
    await interaction.followUp("Error connecting.");
    console.error(e);
    return;
  }
}

const searchSong = async (query: string): Promise<Song> => {
  let yt_info = await search(query, { limit: 1 });
  if (!yt_info[0]) return new Song({ title: '', url: '', duration: '', durationSec: 0 });

  return new Song({
    title: yt_info[0].title ?? "Untitled",
    url: yt_info[0].url,
    duration: yt_info[0].durationRaw,
    durationSec: yt_info[0].durationInSec,
  });
}