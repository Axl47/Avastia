import { createAudioPlayer, createAudioResource, joinVoiceChannel, NoSubscriberBehavior, DiscordGatewayAdapterCreator } from "@discordjs/voice";
import * as play from "play-dl";
import { refreshToken, spotify, SpotifyTrack, SpotifyAlbum, playlist_info, video_info, yt_validate, stream, search } from "play-dl"
import { Command } from "../../structures/Command";
import { queue } from "../../structures/Client";
import { Song } from "../../structures/Song";
import { MessageEmbed, TextBasedChannel, User } from "discord.js";
import { SongType } from "../../typings/Song";
import { client } from "../../main";

export var guildId = "";
export var channel: TextBasedChannel;
export var author: User;

export default new Command({
  name: 'play',
  description: 'Plays a song',
  options: [
    {
      name: 'search',
      description: 'Search in YouTube for a song',
      type: 'SUB_COMMAND',
      options: [
        {
          name: 'query',
          description: 'Query to search',
          type: 'STRING',
          required: true,
        }
      ],
    },
    {
      name: 'link',
      description: 'Search a specified URL for a song or playlist',
      type: 'SUB_COMMAND',
      options: [
        {
          name: 'url',
          description: 'URL to play',
          type: 'STRING',
          required: true,
        }
      ],
    }
  ],
  run: async ({ interaction }) => {
    const response = new MessageEmbed().setColor("#15b500").setDescription('');

    // Get channel from the message
    if (!interaction.member.voice.channel) {
      response.setDescription(`You need to be in a voice channel to execute this command ${interaction.user}!`);
      return interaction.followUp({ embeds: [response] });
    }

    const voiceChannel = interaction.guild?.voiceStates?.cache?.get(
      interaction.user.id
    )?.channel!;

    guildId = interaction.member.guild.id;
    channel = interaction.channel!;
    author = interaction.user;
    const serverQueue = queue.get(guildId);
    var song: Song;

    if (!serverQueue) {
      try {
        // Join the Voice Channel
        const connection = joinVoiceChannel({
          channelId: voiceChannel.id,
          guildId: guildId,
          adapterCreator: interaction.member.guild.voiceAdapterCreator as DiscordGatewayAdapterCreator,
        });

        // Create a queue
        const queueConstructor = {
          voiceChannel: voiceChannel,
          textChannel: interaction.channel,
          connection: connection,
          player: null,
          songs: [] as Song[],
          loop: false,
          loopCounter: 0,
          stopped: false,
        };

        // Set the queue on the global queue
        queue.set(guildId, queueConstructor);
      } catch (err) {
        queue.delete(guildId);
        interaction.followUp("Error connecting.");
        console.log(err);
        return;
      }
    }

    // Get the server queue
    const songQueue = queue.get(guildId);
    var wasPlaylist = false;
    var first = (songQueue.songs.length) ? false : true;

    if (interaction.options.getSubcommand() === 'link') {

      // Search a Link
      var url = interaction.options.getString('url', true);

      if (url.includes("spotify")) {
        // Spotify Links
        if (play.is_expired()) await refreshToken();


        // Handle Song Link
        if (url.includes("track")) {
          // Get song data
          let sp_data = await spotify(url) as SpotifyTrack;

          // Search song on Youtube
          song = await searchSong(`${sp_data.name} ${sp_data.artists.map(artist => artist.name).join(" ")}`);
          if (!song.url) return interaction.followUp("No video result found.");

          try {
            songQueue.songs.push(song);

            // response.setDescription(`Queued [${song.title}](${song.url}) [${interaction.user}]`);
            // interaction.followUp({ embeds: [response] });
          } catch (err) {
            interaction.followUp("Error playing.");
            console.log(err);
            return queue.delete(guildId);
          }
        }
        // Spotify Playlist and Album Handling
        else if (url.includes("playlist") || url.includes("album")) {
          // Search every song on youtube
          const sp_data = await spotify(url) as SpotifyAlbum;
          await sp_data.fetch();

          const tracks = await sp_data.all_tracks();
          try {
            // Add each song to the queue
            for (const track of tracks) {
              song = await searchSong(`${track.name} ${track.artists.map(artist => artist.name).join(" ")}`);
              if (!song.url) continue;
              await songQueue.songs.push(song);
            }

            response.setDescription(`:thumbsup: Added **${tracks.length}** videos to the queue!`);
            interaction.followUp({ embeds: [response] });

            wasPlaylist = true;

            // if (first) {
            //   await videoPlayer(interaction.guild as Guild, songQueue.songs[0], interaction);
            // } else 
            //return (wasPlaylist = false);
          } catch (err) {
            interaction.followUp("Error playing.");
            console.log(err);
            return queue.delete(guildId);
          }
        }
      } else {
        // Manage YouTube Music
        url = url.replace("&feature=share", "");
        url = url.replace("music.", "");

        // YouTube Playlist Links
        if (url.includes("playlist")) {
          try {
            const playlist = await playlist_info(url, {
              incomplete: true,
            });

            // Fetch all playlist videos
            await playlist.fetch();

            const videos = await playlist.all_videos();

            for (const video of videos) {
              if (!video.url) continue;

              song = {
                title: video.title as string,
                url: video.url,
                duration: video.durationRaw,
              };

              await songQueue.songs.push(song);
            }

            response.setDescription(`:thumbsup: Added **${playlist.total_videos}** videos to the queue!`);
            interaction.followUp({ embeds: [response] });

            wasPlaylist = true;

            // if (first) {
            //   await videoPlayer(interaction.guild as Guild, songQueue.songs[0], interaction);
            // }
          } catch (err) {
            console.log(err);
            return interaction.followUp("Failed to queue playlist.");
          }
        }
        // YouTube Links
        else {
          if (url.includes("list")) url = url.substring(0, url.indexOf("list"));

          // Validate link
          if (!validateLink(url)) {
            response.setDescription(`Invalid Link`);
            return interaction.followUp({ embeds: [response] });
          }
          const video = await video_info(url);
          song = {
            title: video.video_details.title,
            url: video.video_details.url,
            duration: video.video_details.durationRaw
          } as Song;

          if (!song.url) return interaction.followUp("No video result found.");

          songQueue.songs.push(song);

        }
      }
    } else {
      // Search Query
      try {
        var query = interaction.options.getString('query', true);

        song = await searchSong(query);
        if (!song.url) return interaction.followUp("No video result found.");

        songQueue.songs.push(song);
      } catch (err) {
        return console.error(err);
      }
    }

    //if (!wasPlaylist) songQueue.songs.push(song);

    try {
      if (first) {
        await videoPlayer(guildId, songQueue.songs[0]);
        client.playerEvents(guildId);
      };
      if (!wasPlaylist) {
        response.setDescription(
          `Queued [${songQueue.songs.at(-1).title}](${songQueue.songs.at(-1).url}) [${interaction.user}]`
        );
        interaction.followUp({ embeds: [response] });
      }

      wasPlaylist = false;
      if (!first) return;
    } catch (err) {
      interaction.followUp("Error playing.");
      console.log(err);
      return queue.delete(guildId);
    }
  }
});

const validateLink = async (link: string) => {
  return (link.startsWith("https") && yt_validate(link) == "video");
}

// Function for playing audio
export const videoPlayer = async (guildId: string, song: Song) => {

  // Get the server queue
  const songQueue = await queue.get(guildId);

  // Basic Error Handling
  if (!song) queue.delete(guildId);
  if (!song.title) song.title = "";

  try {
    // Create Player
    if (!songQueue.player) {
      const player = createAudioPlayer({
        behaviors: {
          noSubscriber: NoSubscriberBehavior.Play,
        },
      });
      songQueue.player = player;
    }

    // Create Player Resources
    let s = await stream(song.url);
    let resource = createAudioResource(s.stream, { inputType: s.type });

    // Play the Audio
    await songQueue.connection.subscribe(songQueue.player);
    await songQueue.player.play(resource);
    if (!songQueue.connection) {
      songQueue.player.stop();
      queue.delete(guildId);
      return;
    }
  } catch (err) {
    console.error(err);
    await songQueue.songs.shift();
    if (songQueue.songs[0]) {
      videoPlayer(guildId, songQueue.songs[0]);
      return;
    }
    else return;
  }
};

const searchSong = async (query: string): Promise<Song> => {
  var yt_info = await search(query, { limit: 1 });
  if (!yt_info[0]) return new Song({ title: '', url: '', duration: '' });

  return new Song({
    title: yt_info[0].title as string,
    url: yt_info[0].url,
    duration: yt_info[0].durationRaw,
  } as SongType);
}