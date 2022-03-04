const {
  createAudioPlayer,
  createAudioResource,
  joinVoiceChannel,
  NoSubscriberBehavior,
  AudioPlayerStatus,
} = require("@discordjs/voice");
const play = require("play-dl");
const queue = new Map();

// Function for playing audio
const videoPlayer = async (guild, song) => {
	
  // Get the server queue
  const songQueue = queue.get(guild.id);

  // Basic Error Handling
  if (!song) return queue.delete(guild.id);
  if (!song.title) song.title = "Undefined";
  if (!song.url) return message.channel.send(`Error searching for the song ${message.author}!`);

  try {
    // Create Player
    if (songQueue.player === null) {
      const player = createAudioPlayer({
        behaviors: {
          noSubscriber: NoSubscriberBehavior.Play,
        },
      });
      songQueue.player = player;
    }

    // Create Player Resources
    let stream = await play.stream(song.url);
    let resource = createAudioResource(stream.stream, {
      inputType: stream.type,
    });

    // Play the Audio
    songQueue.connection.subscribe(songQueue.player);
    songQueue.player.play(resource);
    if (!songQueue.connection) {
      songQueue.player.stop();
      return queue.delete(message.guild.id);
    }
  } catch (err) {
    if (err.toString().includes("Initial Player Response Data")){
			await videoPlayer(guild, song);
			return;
		}

    console.error(err);
    await songQueue.songs.shift();
    if (songQueue.songs[0]) return videoPlayer(guild, songQueue.songs[0]);
    else return;
  }
};

module.exports = {
  name: "play",
  aliases: ["p"],
  description: "Plays a song",
  async execute(message, args, cmd, client, Discord) {
    // Get channel from the message
    const channel = message.member.voice.channel;
    if (!channel)
      return message.channel.send(
        `You need to be in a voice channel to execute this command ${message.author}!`
      );

    // Get the server queue from the global queue
    const serverQueue = queue.get(message.guild.id);

    if (cmd === "play" || cmd === "p") {
      if (!args.length)
        return message.channel.send(
          `I don't know what to search for ${message.author} :'(!`
        );
      let song = {};

      // Refresh spotify token
      if (play.is_expired()) await play.refreshToken();

      if (!serverQueue) {
        // Create a queue
        const queueConstructor = {
          voiceChannel: channel,
          textChannel: message.channel,
          connection: null,
          player: null,
          songs: [],
          loop: false,
          loopCounter: 0,
          stopped: false,
        };

        // Set the queue on the global queue
        queue.set(message.guild.id, queueConstructor);

        try {
          // Connect to the channel
          const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: message.guild.id,
            adapterCreator: message.guild.voiceAdapterCreator,
          });
          queueConstructor.connection = connection;
        } catch (err) {
          queue.delete(message.guild.id);
          message.channel.send("Error connecting.");
          console.log(err);
          return;
        }
      }

      // Get the server queue
      const songQueue = queue.get(message.guild.id);
      var first = false;

      // Spotify links
      if (args[0].includes("spotify")) {
        // Handle Song Link
        if (args[0].includes("track")) {
          var wasPlaylist = false;
          if (songQueue.songs.length === 0) {
            first = true;
          }

          // Get song data
          let sp_data = await play.spotify(args[0]);

          // Search song on Youtube
          var yt_info = await play.search(
            `${sp_data.name} ${sp_data.artists.join(" ")}`,
            { limit: 1 }
          );
          if (!yt_info) return message.channel.send("No video result found.");
          try {
            song = {
              title: yt_info[0].title,
              url: yt_info[0].url,
              duration: yt_info[0].durationRaw,
            };

            songQueue.songs.push(song);
            if (first) await videoPlayer(message.guild, songQueue.songs[0]);
            else {
              const newEmbed = new Discord.MessageEmbed()
                .setColor("#f22222")
                .setDescription(
                  `Queued [${song.title}](${song.url}) [${message.author}]`
                );
              message.reply({ embeds: [newEmbed] });
            }
          } catch (err) {
            message.channel.send("Error playing.");
            console.log(err);
            return queue.delete(message.channel.id);
          }
        }
        // Spotify Playlist and Album Handling
        else if (args[0].includes("playlist") || args[0].includes("album")) {
          if (songQueue.songs.length === 0) first = true;

          // Search every song on youtube
          let sp_data = await play.spotify(args[0]);
          await sp_data.fetch();
          try {
            // Add each song to the queue
            for (let i = 0; i < sp_data.fetched_tracks.get("1").length; i++) {
              let spot = sp_data.fetched_tracks.get("1")[i];
              let yt_info = await play.search(
                `${spot.name} ${spot.artists[0].name}`,
                { limit: 1 }
              );

              if (!yt_info) {
                message.channel.send("No video result found for " + spot.name);
                continue;
              }
              song = {
                title: yt_info[0].title,
                url: yt_info[0].url,
                duration: yt_info[0].durationRaw,
              };
              if (!song.title || !song.url) continue;
              await songQueue.songs.push(song);
            }

            message.channel.send(
              `:thumbsup: Added **${
                sp_data.fetched_tracks.get("1").length
              }** videos to the queue!`
            );

            var wasPlaylist = true;

            if (first) {
              await videoPlayer(message.guild, songQueue.songs[0]);
              first = false;
            } else return (wasPlaylist = false);
          } catch (err) {
            message.channel.send("Error playing.");
            console.log(err);
            return queue.delete(message.channel.id);
          }
        }
      }
      // Youtube Playlist
      else if (args[0].includes("playlist")) {
        args[0].includes("feature=")
          ? (query = args[0].replace("&feature=share", ""))
          : (query = args[0]);
        if (args[0].includes("music.")) query = query.replace("music.", "");
        if (songQueue.songs.length === 0) first = true;

        try {
          const playlist = await play.playlist_info(query, {
            incomplete: true,
          });

          // Fetch all playlist videos
          await playlist.fetch();

          // Search and add each song to the queue
          for (let j = 1; j <= playlist.total_pages; j++) {
            for (let i = 0; i < playlist.page(j).length; i++) {
              let spot = playlist.page(j)[i];
              song = {
                title: spot.title,
                url: spot.url,
                duration: spot.durationRaw,
              };
              if (!song.title || !song.url) {
                message.channel.send(`No result for ${spot.title}`);
                continue;
              }
              await songQueue.songs.push(song);
            }
          }
          message.channel.send(
            `:thumbsup: Added **${playlist.total_videos}** videos to the queue!`
          );

          var wasPlaylist = true;

          if (first) {
            await videoPlayer(message.guild, songQueue.songs[0]);
            first = false;
          }
        } catch (err) {
          console.log(err);
          return message.reply("Failed to queue playlist.");
        }
      } else {
        // Manage Youtube Music links
        if (args[0].includes("music")) {
          try {
            args[0].includes("feature=")
              ? (query = args[0].replace("&feature=share", ""))
              : (query = args[0]);
            query = query.replace("music.", "");

            if (songQueue.songs.length === 0) first = true;
            var wasPlaylist = false;

            // Search song
            var yt_info = await play.search(query, { limit: 1 });
            if (!yt_info) return message.channel.send("No video result found.");
            song = {
              title: yt_info[0].title,
              url: yt_info[0].url,
              duration: yt_info[0].durationRaw,
            };
          } catch (err) {
            console.log(err);
            return;
          }
        } else {
          // Manage valid YouTube links
					try{
          if (args[0].startsWith("https") && play.yt_validate(args[0]) == "video") {
            var yt_info = await play.video_info(args[0]);
            try {
              song = { title: yt_info["video_details"].title, url: args[0] };
              if (!song.title) song.title = "Undefined";
              if (songQueue.songs.length === 0) first = true;
							
            } catch (err) {
              message.channel.send("Error playing.");
              console.log(err);
              return queue.delete(message.channel.id);
            }
						
          } else {
            // Search query on youtube
            try {
              var yt_info = await play.search(args, { limit: 1 });
              if (!yt_info) return message.channel.send("No video result found.");

              song = {
                title: yt_info[0].title,
                url: yt_info[0].url,
                duration: yt_info[0].durationRaw,
              };
              if (!song.title || !song.url) return message.channel.send("No video result found.");
							
              if (songQueue.songs.length === 0) first = true;
							
            } catch (err) {
              await songQueue.songs.shift();
              if (songQueue.songs[0])
                return videoPlayer(guild, songQueue.songs[0]);
              else return;
            }
          }
					} catch(err){
						console.error(err);
						message.channel.send("Error playing song.");
						return songQueue.songs.shift();
					}
        }

        songQueue.songs.push(song);
				
        try {
          if (first) await videoPlayer(message.guild, songQueue.songs[0]);
          else if (!wasPlaylist) {
						
            const newEmbed = new Discord.MessageEmbed()
              .setColor("#f22222")
              .setDescription(
                `Queued [${song.title}](${song.url}) [${message.author}]`
              );
            message.channel.send({ embeds: [newEmbed] });
          }
					
          wasPlaylist = false;
          if (!first) return;
					
        } catch (err) {
          message.channel.send("Error playing.");
          console.log(err);
          return queue.delete(message.channel.id);
        }
      }
    }

    const songQueue = queue.get(message.guild.id);
    songQueue.player.on(AudioPlayerStatus.Playing, () => {
      songQueue.stopped = false;
      try {
        const newEmbed = new Discord.MessageEmbed()
          .setColor("#f22222")
          .setDescription(`Started playing [${songQueue.songs[songQueue.loopCounter].title}](${songQueue.songs[songQueue.loopCounter].url}) [${message.author}]`);
        return message.channel.send({ embeds: [newEmbed] });
				
      } catch (err) {
        console.log(err);
				message.channel.send("Error playing.")
        return queue.delete(message.guild.id);
      }
    });

    songQueue.player.on(AudioPlayerStatus.Idle, () => {
      try {
        if (songQueue.loop) {
          songQueue.loopCounter++;
          if (songQueue.loopCounter >= songQueue.songs.length) songQueue.loopCounter = 0;
					
          return videoPlayer(message.guild, songQueue.songs[songQueue.loopCounter]);
        } else {
          songQueue.songs.shift();

          if (songQueue.songs.length) return videoPlayer(message.guild, songQueue.songs[0]);
          else if (songQueue.stopped === false) {
            songQueue.connection?.destroy();
            return queue.delete(message.guild.id);
          }
        }
      } catch (err) {
        console.error(err);
        songQueue.connection?.destroy();
				message.channel.send("Error stopping.");
        return queue.delete(message.guild.id);
      }
    });
  },
  queue,
  videoPlayer,
};