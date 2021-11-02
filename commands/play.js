const { createAudioPlayer, createAudioResource, joinVoiceChannel, NoSubscriberBehavior, AudioPlayerStatus } = require('@discordjs/voice')
const MessageEmbed = require('discord.js');
const play = require('play-dl');
const queue = new Map();

module.exports = {
    name: 'play',
    aliases: ['p', 'skip', 's', 'pause', 'resume', 'unpause', 'stop', 'loop', 'jump', 'now', 'np', 'shuffle', 'queue'],
    description: 'Music bot',
    async execute(message, args, cmd, client, Discord){
        const channel = message.member.voice.channel;

        if(!channel) return message.channel.send(`You need to be in a voice channel to execute this command ${message.author}!`);
        const serverQueue = queue.get(message.guild.id);

        if(cmd === 'play' || cmd === 'p'){
            if(!args.length) return message.channel.send(`I don't know what to search for ${message.author} :'(!`);
            let song = {};

            if(play.is_expired()){
                await play.refreshToken();
            }
            
            if(!serverQueue){
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
                queue.set(message.guild.id, queueConstructor);

                try{
                    const connection = joinVoiceChannel({
                        channelId: channel.id,
                        guildId: message.guild.id,
                        adapterCreator: message.guild.voiceAdapterCreator
                    })
                    queueConstructor.connection = connection;
                } catch (err){
                    queue.delete(message.guild.id);
                    message.channel.send("Error connecting.");
                    throw err;
                }
            }
            const songQueue = queue.get(message.guild.id);
            var first = false;

            if(args[0].includes('track')){
                var wasPlaylist = false;
                if(songQueue.songs.length === 0){
                    first = true;
                }
                let sp_data = await play.spotify(args[0]);
                var yt_info = await play.search(`${sp_data.name}`, { limit : 1 });
                if(!yt_info) return message.channel.send('No video result found.');
                song = { title: yt_info[0].title, url: yt_info[0].url }
            
            }else if(args[0].includes('spotify') && (args[0].includes('playlist') || args[0].includes('album'))){
                if(songQueue.songs.length === 0){
                    first = true;
                }
                let sp_data = await play.spotify(args[0]);

                for(let i = 0; i < sp_data.fetched_tracks.get('1').length; i++){
                    let yt_info = await play.search(`${sp_data.fetched_tracks.get('1')[i].name}`, { limit : 1 });
                    if(!yt_info){
                        message.channel.send('No video result found for ' + sp_data.fetched_tracks.get('1')[i].name)
                        continue;
                    }
                    song = { title: yt_info[0].title, url: yt_info[0].url }
                    await songQueue.songs.push(song);
                }

                message.channel.send(`:thumbsup: Added **${sp_data.fetched_tracks.get('1').length}** videos to the queue!`);
                if(first){
                    await videoPlayer(message.guild, songQueue.songs[0]);
                    first = false;
                }
                var wasPlaylist = true;

            } else if(args[0].includes('playlist')){
                if(songQueue.songs.length === 0){
                    first = true;
                }

                const playlist = await play.playlist_info(args[0], { incomplete : true });
                // Fetch all playlist videos
                await playlist.fetch();

                for(let j = 1; j <= playlist.total_pages; j++){
                    for(let i = 0; i < playlist.page(j).length; i++){
                        song = { title: playlist.page(j)[i].title, url: playlist.page(j)[i].url }
                        await songQueue.songs.push(song);
                    }
                }
                message.channel.send(`:thumbsup: Added **${playlist.total_videos}** videos to the queue!`);
                if(first){
                    await videoPlayer(message.guild, songQueue.songs[0]);
                    first = false;
                }
                var wasPlaylist = true;

                } else{
                if(songQueue.songs.length === 0){
                    first = true;
                }
                var wasPlaylist = false;
                var yt_info = await play.search(args, {limit: 1});
                if(!yt_info) return message.channel.send('No video result found.');
                song = { title: yt_info[0].title, url: yt_info[0].url }
            }

            if(first){
                songQueue.songs.push(song);
                await videoPlayer(message.guild, songQueue.songs[0]);

            } else if(!wasPlaylist){
                songQueue.songs.push(song);

                const newEmbed = new Discord.MessageEmbed()
                    .setColor('#f22222')
                    .setDescription(`Queued [${song.title}](${song.url}) [${message.author}]`);
            
                message.reply({ embeds: [newEmbed] });
            } else{
                wasPlaylist = false;
            }

            if(!first){
                return;
            }
        } else if(cmd === 'skip' || cmd === 's'){
            const songQueue = queue.get(message.guild.id);
            if(!songQueue){
                const newEmbed = new Discord.MessageEmbed()
                    .setColor('#f22222')
                    .setDescription('Not playing anything.');
            
                return message.reply({ embeds: [newEmbed] });
            }
            if(songQueue.loop){
                songQueue.loopCounter++;
                if(songQueue.loopCounter >= songQueue.songs.length){
                    songQueue.loopCounter = 0
                }
                await videoPlayer(message.guild, songQueue.songs[songQueue.loopCounter]);
                const newEmbed = new Discord.MessageEmbed()
                    .setColor('#f22222')
                    .setDescription('Song skipped');
            
                return message.reply({ embeds: [newEmbed] });
            } else{
                try{
                    songQueue.songs.shift();
                    await videoPlayer(message.guild, songQueue.songs[0]);
                    if(songQueue.songs[0]){
                        const newEmbed = new Discord.MessageEmbed()
                            .setColor('#f22222')
                            .setDescription('Song skipped');
            
                        return message.reply({ embeds: [newEmbed] });
                    } else{
                        const newEmbed = new Discord.MessageEmbed()
                            .setColor('#f22222')
                            .setDescription('End of the queue. Use !stop to stop playback.');
            
                        return message.reply({ embeds: [newEmbed] });
                    }
                } catch{
                    songQueue.player.stop()
                    queue.delete(message.guild.id);
                    return console.log('Error skipping song.');
                }
            }
        } else if(cmd === 'pause'){
            const songQueue = queue.get(message.guild.id);
            if(!songQueue){
                const newEmbed = new Discord.MessageEmbed()
                    .setColor('#f22222')
                    .setDescription('Not playing anything.');
            
                return message.reply({ embeds: [newEmbed] });
            }
            songQueue.player.state.status = 'idle';
            const newEmbed = new Discord.MessageEmbed()
                .setColor('#f22222')
                .setDescription('Playback paused.');
            
            return message.reply({ embeds: [newEmbed] });

        } else if(cmd === 'resume' || cmd === 'unpause'){
            const songQueue = queue.get(message.guild.id);
            if(!songQueue){
                const newEmbed = new Discord.MessageEmbed()
                    .setColor('#f22222')
                    .setDescription('Not playing anything.');
            
                return message.reply({ embeds: [newEmbed] });
            }
            songQueue.player.state.status = 'playing'
            const newEmbed = new Discord.MessageEmbed()
                .setColor('#f22222')
                .setDescription('Playback resumed.');
            
            return message.reply({ embeds: [newEmbed] });

        } else if(cmd === 'stop'){
            const songQueue = queue.get(message.guild.id);
            if(!songQueue){
                const newEmbed = new Discord.MessageEmbed()
                    .setColor('#f22222')
                    .setDescription('Not playing anything.');
            
                return message.reply({ embeds: [newEmbed] });
            }
            songQueue.stopped = true;
            songQueue.loop = false;
            try{
                songQueue.connection.destroy();
            } catch{
                console.log('Already destroyed.');
            }
            queue.delete(message.guild.id);
            songQueue.player.state.status = 'idle';
            const newEmbed = new Discord.MessageEmbed()
                .setColor('#f22222')
                .setDescription('Player stopped.');
            
            return message.reply({ embeds: [newEmbed] });

        } else if(cmd === 'loop'){
            const songQueue = queue.get(message.guild.id);
            if(!songQueue){
                const newEmbed = new Discord.MessageEmbed()
                    .setColor('#f22222')
                    .setDescription('Not playing anything.');
            
                return message.reply({ embeds: [newEmbed] });
            }
            songQueue.loop = !songQueue.loop;
            if(songQueue.loop === false) songQueue.loopCounter = 0;
            const newEmbed = new Discord.MessageEmbed()
                .setColor('#f22222');
            
            (songQueue.loop) ? newEmbed.setDescription('Now looping.') : newEmbed.setDescription('Stopped looping.');
            return message.reply({ embeds: [newEmbed] });
        } else if(cmd === 'jump'){
            const songQueue = queue.get(message.guild.id);
            if(!songQueue){
                const newEmbed = new Discord.MessageEmbed()
                    .setColor('#f22222')
                    .setDescription('Not playing anything.');
            
                return message.reply({ embeds: [newEmbed] });
            }

            if(songQueue.loop){
                if(songQueue.songs.length >= args[0] + songQueue.loopCounter){
                    songQueue.loopCounter += args[0];
                    await videoPlayer(message.guild, songQueue.songs[songQueue.loopCounter]);
                    const newEmbed = new Discord.MessageEmbed()
                        .setColor('#f22222')
                        .setDescription(`Jumped **${args[0]}** songs.`);
            
                    return message.reply({ embeds: [newEmbed] });
                } else{
                    n = args[0];
                    while(n){
                        songQueue.loopCounter++;
                        if(songQueue.loopCounter >= songQueue.songs.length){
                            songQueue.loopCounter = 0
                        }
                        n--;
                    }
                    return videoPlayer(message.guild, songQueue.songs[songQueue.loopCounter]);
                }
            } else if(songQueue.songs.length >= args[0]){
                for(let i = 0; i < args[0]; i++){
                    songQueue.songs.shift()
                }
                await videoPlayer(message.guild, songQueue.songs[0])
                const newEmbed = new Discord.MessageEmbed()
                        .setColor('#f22222')
                        .setDescription(`Jumped **${args[0]}** songs.`);
            
                return message.reply({ embeds: [newEmbed] });
            } else{
                const newEmbed = new Discord.MessageEmbed()
                .setColor('#f22222')
                .setTitle('Cannot jump that many songs.')
                .setDescription(`Queue length is ${songQueue.songs.length}.`);
            
                return message.reply({ embeds: [newEmbed] });
            }
        } else if(cmd === 'np' || (cmd === 'now' && args[0] === 'playing')){
            const songQueue = queue.get(message.guild.id);
            if(!songQueue){
                const newEmbed = new Discord.MessageEmbed()
                    .setColor('#f22222')
                    .setDescription('Not playing anything.');
            
                return message.reply({ embeds: [newEmbed] });
            }
            const newEmbed = new Discord.MessageEmbed()
                    .setColor('#f22222')
                    .setDescription(`[${songQueue.songs[songQueue.loopCounter].title}](${songQueue.songs[songQueue.loopCounter].url}) [${message.author}]`);
            
            return message.reply({ embeds: [newEmbed] });
        } else if(cmd === 'shuffle'){
            const songQueue = queue.get(message.guild.id);
            if(!songQueue){
                const newEmbed = new Discord.MessageEmbed()
                    .setColor('#f22222')
                    .setDescription('Not playing anything.');
            
                return message.reply({ embeds: [newEmbed] });
            }
            await shuffle(songQueue.songs);
            const newEmbed = new Discord.MessageEmbed()
                    .setColor('#f22222')
                    .setDescription('Queue shuffled.');
            
                return message.reply({ embeds: [newEmbed] });
        } else if(cmd === 'queue'){
            const songQueue = queue.get(message.guild.id);
            if(!songQueue){
                const newEmbed = new Discord.MessageEmbed()
                    .setColor('#f22222')
                    .setDescription('Not playing anything.');
            
                return message.reply({ embeds: [newEmbed] });
            }
            let newEmbed = new Discord.MessageEmbed()
                .setColor('#304281');

                for(let i = 0; i < songQueue.songs.length; i++){
                    if(i%21 === 0 && i != 0){
                        message.reply({ embeds: [newEmbed] });
                        newEmbed = new Discord.MessageEmbed()
                        .setColor('#304281');
                        if(i === songQueue.songs.length - 1){
                            return;
                        }
                    }
                    newEmbed.addField(`\u200B`, `${i+1}) ${songQueue.songs[i].title}`, true);
                }
            
            return message.reply({ embeds: [newEmbed] });
        }



        const songQueue = queue.get(message.guild.id);
        songQueue.player.on(AudioPlayerStatus.Playing, () =>{
            songQueue.stopped = false;
            try{
                const newEmbed = new Discord.MessageEmbed()
                    .setColor('#f22222')
                    .setDescription(`Started playing [${songQueue.songs[songQueue.loopCounter].title}](${songQueue.songs[songQueue.loopCounter].url}) [${message.author}]`);
            
                return message.reply({ embeds: [newEmbed] });
            } catch{
                console.log('Error playing song.');
                return queue.delete(message.guild.id);
            }
        });

        songQueue.player.on(AudioPlayerStatus.Idle, () =>{
            if(songQueue.loop){
                songQueue.loopCounter++;
                if(songQueue.loopCounter >= songQueue.songs.length){
                    songQueue.loopCounter = 0;
                }
            return videoPlayer(message.guild, songQueue.songs[songQueue.loopCounter]);

            } else{
                songQueue.songs.shift();
                if(songQueue.songs.length){
                    return videoPlayer(message.guild, songQueue.songs[0]);
                } else{
                    if(songQueue.stopped === false){
                        songQueue.connection.destroy();
                        return queue.delete(message.guild.id);
                    }
                }
            }
        });
    }
}

const videoPlayer = async (guild, song) =>{
    const songQueue = queue.get(guild.id);

    if(songQueue.player === null){
        const player = createAudioPlayer({
            behaviors: {
                noSubscriber: NoSubscriberBehavior.Play
            }
        });
        songQueue.player = player;
    }

    if(!song){;
        return queue.delete(guild.id);
    }

    let stream = await play.stream(song.url);
    let resource = createAudioResource(stream.stream, {
        inputType : stream.type
    });
    songQueue.player.play(resource);

    try{
        songQueue.connection.subscribe(songQueue.player);
    } catch{
        songQueue.player.stop();
    }
}

function shuffle(array) {
    x = array.shift()
    let currentIndex = array.length,  randomIndex;
  
    // While there remain elements to shuffle...
    while (currentIndex != 0) {
  
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
    array.unshift(x)
    return array;
}