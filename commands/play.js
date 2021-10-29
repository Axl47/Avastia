const { createAudioPlayer, createAudioResource , StreamType, demuxProbe, joinVoiceChannel, NoSubscriberBehavior, AudioPlayerStatus, VoiceConnectionStatus, getVoiceConnection } = require('@discordjs/voice')
const play = require('play-dl');
const music = require('@koenie06/discord.js-music');

const queue = new Map();
var player = createAudioPlayer({
    behaviors: {
        noSubscriber: NoSubscriberBehavior.Play
    }
});
var loop = false;
var counter = 0;

module.exports = {
    name: 'play',
    aliases: ['p', 'skip', 's', 'pause', 'resume', 'stop', 'loop'],
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
            if(args[0].includes('track')){
                let sp_data = await play.spotify(args[0]);
                var yt_info = await play.search(`${sp_data.name}`, { limit : 1 });
            } else if(args[0].includes('playlist')){
                const playlist = await play.playlist_info(args[0], { incomplete : true });
                //Fetch all playlist videos
                await playlist.fetch();
                for(let i = 0; i < playlist.total_videos; i++){
                    console.log(playlist.videos[i].title);
                }
                message.channel.send(`:thumbsup: Added **${playlist.total_videos}** videos to the queue!`);
                return message.channel.send(`:musical_note:  Started playing **${playlist.title[0]}**!`);
            } else{
                var yt_info = await play.search(args, {limit: 1});
            }
            if(!yt_info) return message.channel.send('No video result found.');
            song = { title: yt_info[0].title, url: yt_info[0].url }

            if(!serverQueue){
                const queueConstructor = {
                    voiceChannel: channel,
                    textChannel: message.channel,
                    connection: null,
                    songs: []
                };
                queue.set(message.guild.id, queueConstructor);
                queueConstructor.songs.push(song);

                try{
                    const connection = joinVoiceChannel({
                        channelId: channel.id,
                        guildId: message.guild.id,
                        adapterCreator: message.guild.voiceAdapterCreator
                    })
                    queueConstructor.connection = connection;
                    
                    videoPlayer(message.guild, queueConstructor.songs[0]);
                } catch (err){
                    queue.delete(message.guild.id);
                    message.channel.send("Error connecting.");
                    throw err;
                }
            } else{
                serverQueue.songs.push(song);
                return message.channel.send(`:thumbsup: Added **${song.title}** to the queue!`);
            }
            await player.on(AudioPlayerStatus.Playing, () =>{
                const songQueue = queue.get(message.guild.id);
                try{
                    return message.channel.send(`:musical_note:  Started playing **${songQueue.songs[counter].title}**!`);
                } catch{
                    return queue.delete(message.guild.id);
                }
            });
        } else if(cmd === 'skip' || cmd === 's'){
            const songQueue = queue.get(message.guild.id);
            if(loop){
                counter++;
                if(counter >= songQueue.songs.length){
                    counter = 0
                }
                videoPlayer(message.guild, songQueue.songs[counter]);
            } else{
                try{
                    songQueue.songs.shift();
                    videoPlayer(message.guild, songQueue.songs[0]);
                    if(songQueue.songs[0]){
                        return message.channel.send('Song skipped.');
                    } else{
                        return message.reply('End of the queue. Use !stop to stop playback.');
                    }
                } catch{
                    player.stop()
                    queue.delete(message.guild.id);
                }
            }
        } else if(cmd === 'pause'){
            await player.pause();
            return message.reply('Playback paused.');

        } else if(cmd === 'resume'){
            await player.unpause();
            return message.reply('Playback resumed.');

        } else if(cmd === 'stop'){
            const songQueue = queue.get(message.guild.id);
            await player.stop();
            await songQueue.connection.destroy();
            queue.delete(message.guild.id);
            return message.reply('Playback stopped.');

        } else if(cmd === 'loop'){
            loop = !loop;
            if(loop === false) counter = 0;
            return (loop) ? message.reply('Now looping.') : message.reply('Stopped looping.')
        }
        const songQueue = queue.get(message.guild.id);

        player.on(AudioPlayerStatus.Idle, () =>{
            if(loop){
                counter++;
                if(counter >= songQueue.songs.length){
                    counter = 0;
                }
                return videoPlayer(message.guild, songQueue.songs[counter]);
            } else{
                try{
                    songQueue.songs.shift();
                    if(songQueue.songs.length){
                        return videoPlayer(message.guild, songQueue.songs[0]);
                    } else{
                        try{
                            songQueue.connection.destroy();
                            queue.delete(message.guild.id);
                        return message.reply('Playback stopped.');
                        } catch (err){
                            queue.delete(message.guild.id);
                            return;
                        }
                }
                } catch{
                    queue.delete(message.guild.id);
                }
            }
        });
    }
}

const videoPlayer = async (guild, song) =>{
    const songQueue = queue.get(guild.id);

    if(!song){;
        return queue.delete(guild.id);
    }

    let stream = await play.stream(song.url);
    let resource = createAudioResource(stream.stream, {
        inputType : stream.type
    });

    player.play(resource);
    try{
        songQueue.connection.subscribe(player);
    } catch{
        player.stop();
    }
}