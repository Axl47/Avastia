const { createAudioPlayer, createAudioResource , StreamType, demuxProbe, joinVoiceChannel, NoSubscriberBehavior, AudioPlayerStatus, VoiceConnectionStatus, getVoiceConnection } = require('@discordjs/voice')
const play = require('play-dl');

const queue = new Map();
var loop = false;
var counter = 0;
var stopped = false;
var playing = false;

module.exports = {
    name: 'play',
    aliases: ['p', 'skip', 's', 'pause', 'resume', 'stop', 'loop', 'jump'],
    description: 'Music bot',
    async execute(message, args, cmd, client, Discord){
        const channel = message.member.voice.channel;

        if(!channel) return message.channel.send(`You need to be in a channel to execute this command ${message.author}!`);
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
                    songs: []
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

            if(args[0].includes('track')){
                var wasPlaylist = false;
                let sp_data = await play.spotify(args[0]);
                var yt_info = await play.search(`${sp_data.name}`, { limit : 1 });
                if(!yt_info) return message.channel.send('No video result found.');
                song = { title: yt_info[0].title, url: yt_info[0].url }
            
            }else if(args[0].includes('spotify') && (args[0].includes('playlist') || args[0].includes('album'))){
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
                await videoPlayer(message.guild, songQueue.songs[0]);
                var wasPlaylist = true;

            } else if(args[0].includes('playlist')){
                const playlist = await play.playlist_info(args[0], { incomplete : true });
                // Fetch all playlist videos

                await playlist.fetch();
                for(let i = 0; i < playlist.total_videos; i++){
                    song = { title:playlist.videos[i].title, url: playlist.videos[i].url }
                    await songQueue.songs.push(song);
                }
                message.channel.send(`:thumbsup: Added **${playlist.total_videos}** videos to the queue!`);
                await videoPlayer(message.guild, songQueue.songs[0]);
                var wasPlaylist = true;

                } else{
                var wasPlaylist = false;
                var yt_info = await play.search(args, {limit: 1});
                if(!yt_info) return message.channel.send('No video result found.');
                song = { title: yt_info[0].title, url: yt_info[0].url }
            }

            if(songQueue.songs.length === 0){
                songQueue.songs.push(song);
                await videoPlayer(message.guild, songQueue.songs[0]);

            } else if(!wasPlaylist){
                songQueue.songs.push(song);
                message.channel.send(`:thumbsup: Added **${song.title}** to the queue!`);
            } else{
                wasPlaylist = false;
            }
        } else if(cmd === 'skip' || cmd === 's'){
            const songQueue = queue.get(message.guild.id);
            if(loop){
                counter++;
                if(counter >= songQueue.songs.length){
                    counter = 0
                }
                await videoPlayer(message.guild, songQueue.songs[counter]);
                return message.channel.send('Song skipped.');
            } else{
                try{
                    songQueue.songs.shift();
                    await videoPlayer(message.guild, songQueue.songs[0]);
                    if(songQueue.songs[0]){
                        return message.channel.send('Song skipped.');
                    } else{
                        return message.reply('End of the queue. Use !stop to stop playback.');
                    }
                } catch{
                    player.stop()
                    queue.delete(message.guild.id);
                    return console.log('Error skipping song.');
                }
            }
        } else if(cmd === 'pause'){
            const songQueue = queue.get(message.guild.id);
            await songQueue.player.pause();
            return message.reply('Playback paused.');

        } else if(cmd === 'resume'){
            const songQueue = queue.get(message.guild.id);
            await songQueue.player.unpause();
            return message.reply('Playback resumed.');

        } else if(cmd === 'stop'){
            const songQueue = queue.get(message.guild.id);
            stopped = true;
            loop = false;
            try{
                songQueue.connection.destroy();
            } catch{
                console.log('Already destroyed.');
            }
            queue.delete(message.guild.id);
            songQueue.player.state.status = 'idle'
            return message.reply('Playback stopped.');

        } else if(cmd === 'loop'){
            loop = !loop;
            if(loop === false) counter = 0;
            return (loop) ? message.reply('Now looping.') : message.reply('Stopped looping.')
        } else if(cmd == 'jump'){
            return console.log('Jumped');
        }



        const songQueue = queue.get(message.guild.id);
        songQueue.player.on(AudioPlayerStatus.Playing, () =>{
            stopped = false;
            playing = true;
            try{
                message.channel.send(`:musical_note:  Started playing **${songQueue.songs[counter].title}**!`);
            } catch{
                console.log('Error playing song.');
                return queue.delete(message.guild.id);
            }
        });
        songQueue.player.on(AudioPlayerStatus.Idle, () =>{
            playing = false;
            if(loop){
                counter++;
                if(counter >= songQueue.songs.length){
                    counter = 0;
                }
                return videoPlayer(message.guild, songQueue.songs[counter]);

            } else{
                songQueue.songs.shift();
                if(songQueue.songs.length){
                    return videoPlayer(message.guild, songQueue.songs[0]);
                } else{
                    if(stopped === false){
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