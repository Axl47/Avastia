const { createAudioPlayer, createAudioResource, joinVoiceChannel, NoSubscriberBehavior, AudioPlayerStatus } = require('@discordjs/voice')
const MessageEmbed = require('discord.js');
const play = require('play-dl');
const queue = new Map();

const videoPlayer = async (guild, song) => {
  const songQueue = queue.get(guild.id);
  if (!song.title) song.title = "Undefined";
  try {
    if (songQueue.player === null) {
      const player = createAudioPlayer({
        behaviors: {
          noSubscriber: NoSubscriberBehavior.Play
        }
      });
      songQueue.player = player;
    }

    if (!song) return queue.delete(guild.id);

    let stream = await play.stream(song.url);
    let resource = createAudioResource(stream.stream, {
      inputType: stream.type
    });
    try {
      songQueue.player.play(resource);
      songQueue.connection.subscribe(songQueue.player);
      if (!songQueue.connection) {
        songQueue.player.stop();
        return queue.delete(message.guild.id);
      }
    } catch (err) {
      await songQueue.songs.shift();
      if (songQueue.songs[0]) return videoPlayer(guild, songQueue.songs[0]);
      else return;
    }
  }
  catch (err) {
    console.log(err);
    await songQueue.songs.shift();
    if (songQueue.songs[0]) return videoPlayer(guild, songQueue.songs[0]);
    else return;
  }
}

module.exports = {
  name: 'play',
  aliases: ['p'],
  description: 'Plays a song',
  async execute(message, args, cmd, client, Discord) {
    const channel = message.member.voice.channel;
    if (!channel) return message.channel.send(`You need to be in a voice channel to execute this command ${message.author}!`);

    // Get the server queue from the global queue
    const serverQueue = queue.get(message.guild.id);

    if (cmd === 'play' || cmd === 'p') {
      if (!args.length) return message.channel.send(`I don't know what to search for ${message.author} :'(!`);
      let song = {};

      // Refresh spotify's token
      if (play.is_expired()) await play.refreshToken();


      if (!serverQueue) {
        //create a queue
        const queueConstructor = {
          voiceChannel: channel,
          textChannel: message.channel,
          connection: null,
          player: null,
          songs: [],
          loop: false,
          loopCounter: 0,
          stopped: false
        };

        //set the queue on the global queue
        queue.set(message.guild.id, queueConstructor);

        try {
          const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: message.guild.id,
            adapterCreator: message.guild.voiceAdapterCreator
          })
          queueConstructor.connection = connection;
        } catch {
          queue.delete(message.guild.id);
          message.channel.send("Error connecting.");
          return;
        }
      }

      //get the server queue
      const songQueue = queue.get(message.guild.id);
      var first = false;

      // Spotify link handling
      if (args[0].includes('spotify')) {
        if (args[0].includes('track')) {
          var wasPlaylist = false;
          if (songQueue.songs.length === 0) {
            first = true;
          }

          // Get song data
          let sp_data = await play.spotify(args[0]);

          // Search song on Youtube
          var yt_info = await play.search(`${sp_data.name} + ${sp_data.artists}`, { limit: 1 });

          if (!yt_info) return message.channel.send('No video result found.');
          song = { title: yt_info[0].title, url: yt_info[0].url }

          if (first) {
            songQueue.songs.push(song);
            await videoPlayer(message.guild, songQueue.songs[0]);
          } else {
            songQueue.songs.push(song);

            const newEmbed = new Discord.MessageEmbed()
              .setColor('#f22222')
              .setDescription(`Queued [${song.title}](${song.url}) [${message.author}]`);

            message.reply({ embeds: [newEmbed] });
          }



        } else if (args[0].includes('playlist') || args[0].includes('album')) {
          if (songQueue.songs.length === 0) first = true;

          // Search every song on youtube
          let sp_data = await play.spotify(args[0]);
          await sp_data.fetch();

          for (let i = 0; i < sp_data.fetched_tracks.get('1').length; i++) {
            let yt_info = await play.search(`${sp_data.fetched_tracks.get('1')[i].name}`, { limit: 1 });
            if (!yt_info) {
              message.channel.send('No video result found for ' + sp_data.fetched_tracks.get('1')[i].name)
              continue;
            }
            song = { title: yt_info[0].title, url: yt_info[0].url }
            if (!song.title || !song.url) continue;
            await songQueue.songs.push(song);
          }

          message.channel.send(`:thumbsup: Added **${sp_data.fetched_tracks.get('1').length}** videos to the queue!`);

          var wasPlaylist = true;

          if (first) {
            await videoPlayer(message.guild, songQueue.songs[0]);
            first = false;
          } else return wasPlaylist = false;
        }
      } else if (args[0].includes('playlist')) {
        (args[0].includes('feature=')) ? query = args[0].replace('&feature=share', '') : query = args[0];
        if (args[0].includes('music.')) query = query.replace('music.', '');
        if (songQueue.songs.length === 0) first = true;
        try {
          const playlist = await play.playlist_info(query, { incomplete: true });

          // Fetch all playlist videos
          await playlist.fetch();

          for (let j = 1; j <= playlist.total_pages; j++) {
            for (let i = 0; i < playlist.page(j).length; i++) {
              song = { title: playlist.page(j)[i].title, url: playlist.page(j)[i].url }
              await songQueue.songs.push(song);
            }
          }
          message.channel.send(`:thumbsup: Added **${playlist.total_videos}** videos to the queue!`);

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
        if (args[0].includes('music')) {
          // Manage Youtube Music links
          try {
            (args[0].includes('feature=')) ? query = args[0].replace('&feature=share', '') : query = args[0]
            query = query.replace('music.', '')

            if (songQueue.songs.length === 0) {
              first = true;
            }

            var wasPlaylist = false;
            var yt_info = await play.search(query, { limit: 1 });
            if (!yt_info) return message.channel.send('No video result found.');
            song = { title: yt_info[0].title, url: yt_info[0].url }
          } catch (err) {
            console.log(err);
            return;
          }

        } else {
          if (args[0].startsWith("https") && play.yt_validate(args[0]) == 'video') {
            if (!song.title || !song.url) return message.channel.send('No video result found.');
            if (songQueue.songs.length === 0) first = true;
            var yt_info = await play.video_info(args[0])
            song = { title: yt_info[0].title, url: yt_info[0].url }
            if (!song.title || !song.url) return message.channel.send('No video result found.');
            if (songQueue.songs.length === 0) first = true;
          } else {
            var yt_info = await play.search(args, { limit: 1 });
            if (!yt_info) return message.channel.send('No video result found.');
            song = { title: yt_info[0].title, url: yt_info[0].url }
            if (!song.title || !song.url) return message.channel.send('No video result found.');
            if (songQueue.songs.length === 0) first = true;
          }
        }

        if (first) {
          songQueue.songs.push(song);
          await videoPlayer(message.guild, songQueue.songs[0]);


        } else if (!wasPlaylist) {
          songQueue.songs.push(song);

          const newEmbed = new Discord.MessageEmbed()
            .setColor('#f22222')
            .setDescription(`Queued [${song.title}](${song.url}) [${message.author}]`);

          message.reply({ embeds: [newEmbed] });
        }
        wasPlaylist = false;
        if (!first) {
          return;
        }
      }
    }

    const songQueue = queue.get(message.guild.id);
    songQueue.player.on(AudioPlayerStatus.Playing, () => {
      songQueue.stopped = false;
      try {
        const newEmbed = new Discord.MessageEmbed()
          .setColor('#f22222')
          .setDescription(`Started playing [${songQueue.songs[songQueue.loopCounter].title}](${songQueue.songs[songQueue.loopCounter].url}) [${message.author}]`);

        return message.reply({ embeds: [newEmbed] });
      } catch {
        console.log('Error playing song.');
        return queue.delete(message.guild.id);
      }
    });

    songQueue.player.on(AudioPlayerStatus.Idle, () => {
      if (songQueue.loop) {
        songQueue.loopCounter++;
        if (songQueue.loopCounter >= songQueue.songs.length) {
          songQueue.loopCounter = 0;
        }
        return videoPlayer(message.guild, songQueue.songs[songQueue.loopCounter]);
      } else {
        songQueue.songs.shift();
        if (songQueue.songs.length) {
          return videoPlayer(message.guild, songQueue.songs[0]);
        } else if (songQueue.stopped === false) {
          songQueue.connection ?.destroy();
          return queue.delete(message.guild.id);
        }
      }
    });
  },
  queue,
  videoPlayer
}