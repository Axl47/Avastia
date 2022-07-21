import { createAudioPlayer, createAudioResource, joinVoiceChannel, NoSubscriberBehavior, DiscordGatewayAdapterCreator } from "@discordjs/voice";
import { is_expired, refreshToken, spotify, SpotifyTrack, SpotifyAlbum, playlist_info, video_info, yt_validate, stream, search } from "play-dl"
import { MessageEmbed, TextBasedChannel, User } from "discord.js";
import { playNextSong } from "../../events/player/idle";
import { Command } from "../../structures/Command";
import { queue } from "../../structures/Client";
import { Song } from "../../structures/Song";
import { client } from "../../main";

export let guildId = "";
export let channel: TextBasedChannel;
export let author: User;

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

    if (!interaction.member.voice.channel) {
      response.setDescription(`You need to be in a voice channel to execute this command ${interaction.user}!`);
      return await interaction.followUp({ embeds: [response] });
    }

    const voiceChannel = interaction.guild?.voiceStates?.cache?.get(
      interaction.user.id
    )?.channel!;

    guildId = interaction.member.guild.id;
    channel = interaction.channel!;
    author = interaction.user;
    const serverQueue = queue.get(guildId);
    let song: Song;

    if (!serverQueue) {
      try {
        const connection = joinVoiceChannel({
          channelId: voiceChannel.id,
          guildId: guildId,
          adapterCreator: interaction.member.guild.voiceAdapterCreator as DiscordGatewayAdapterCreator,
        });

        const queueConstructor = {
          voiceChannel: voiceChannel,
          textChannel: interaction.channel,
          connection: connection,
          player: null,
          songs: [] as Song[],
          stopped: false,
          loop: false,
          loopCounter: 0,
        };

        // Set the queue on the global queue
        queue.set(guildId, queueConstructor);
      } catch (err) {
        queue.delete(guildId);
        await interaction.followUp("Error connecting.");
        console.log(err);
        return;
      }
    }

    // Get the server queue
    const songQueue = queue.get(guildId);
    let wasPlaylist = false;
    let first = (songQueue.songs.length) ? false : true;

    if (interaction.options.getSubcommand() === 'link') {
      let url = interaction.options.getString('url', true);

      if (url.includes("spotify")) {
        if (is_expired()) await refreshToken();


        // Song Link
        if (url.includes("track")) {
          let sp_data = await spotify(url) as SpotifyTrack;

          // Search song on Youtube
          song = await searchSong(`${sp_data.name} ${sp_data.artists.map(artist => artist.name).join(" ")}`);
          if (!song.url) return await interaction.followUp("No video result found.");

          songQueue.songs.push(song);
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
              songQueue.songs.push(song);
            }

            response.setDescription(`:thumbsup: Added **${tracks.length}** videos to the queue!`);
            await interaction.followUp({ embeds: [response] });

            wasPlaylist = true;

          } catch (err) {
            await interaction.followUp("Error playing.");
            console.log(err);
            return;
          }
        }
      } else {
        // Manage YouTube Music
        url = url.replace("&feature=share", "");
        url = url.replace("music.", "");

        // YouTube Playlist Links
        if (url.includes("playlist")) {
          const playlist = await playlist_info(url, { incomplete: true });
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
          await interaction.followUp({ embeds: [response] });

          wasPlaylist = true;
        }
        // YouTube Links
        else {
          if (url.includes("list")) url = url.substring(0, url.indexOf("list"));

          if (!validateLink(url)) {
            response.setDescription(`Invalid Link`);
            return await interaction.followUp({ embeds: [response] });
          }

          const video = await video_info(url);
          song = {
            title: video.video_details.title as string,
            url: video.video_details.url,
            duration: video.video_details.durationRaw
          };

          if (!song.url) return await interaction.followUp("No video result found.");
          if (!song.title) song.title = '';

          songQueue.songs.push(song);
        }
      }
    } else {
      // Search Query
      const query = interaction.options.getString('query', true);

      song = await searchSong(query);
      if (!song.url) return await interaction.followUp("No video result found.");

      songQueue.songs.push(song);
    }
    if (first) {
      await videoPlayer(guildId, songQueue.songs[0]);
      client.playerEvents(guildId);
    }

    if (!wasPlaylist) {
      response.setDescription(`Queued [${songQueue.songs.at(-1).title}](${songQueue.songs.at(-1).url}) [${interaction.user}]`);
      await interaction.followUp({ embeds: [response] });
    }

    wasPlaylist = false;
  }
});

const validateLink = (link: string) => {
  return (link.startsWith("https") && yt_validate(link) == "video");
}

// Function for playing audio
export const videoPlayer = async (guildId: string, song: Song) => {
  // Get the server queue
  const songQueue = queue.get(guildId);

  // Basic Error Handling
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
    let s = await stream(song.url);
    let resource = createAudioResource(s.stream, { inputType: s.type });

    // Play the Audio
    await songQueue.connection.subscribe(songQueue.player);
    await songQueue.player.play(resource);
    if (!songQueue.connection) {
      songQueue.player.stop();
      return queue.delete(guildId);
    }
  } catch (err) {
    console.error(err);
    playNextSong();
  }
};

const searchSong = async (query: string): Promise<Song> => {
  let yt_info = await search(query, { limit: 1 });
  if (!yt_info[0]) return new Song({ title: '', url: '', duration: '' });

  return new Song({
    title: yt_info[0].title as string,
    url: yt_info[0].url,
    duration: yt_info[0].durationRaw,
  });
}