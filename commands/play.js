const { SlashCommandBuilder } = require('@discordjs/builders');
const ytdl = require('ytdl-core');
const ytSearch = require('yt-search');
const music = require('@koenie06/discord.js-music');
const { compare } = require('libsodium-wrappers');
const events = music.event;

module.exports = {
    name: 'play',
    aliases: ['p', 'skip', 's', 'pause', 'resume', 'stop', 'loop'],
    description: 'Music bot',
    async execute(message, args, cmd, client, Discord){
        const channel = message.member.voice.channel;

        if(!channel) return message.channel.send(`You need to be in a channel to execute this command ${message.author}!`);
        if(cmd === 'play' || cmd === 'p'){
            if(!args.length) return message.channel.send(`I don't know what to search for ${message.author}!`);

            if(ytdl.validateURL(args[0])) {
                const song_info = await ytdl.getInfo(args[0]);
                songs = { title: song_info.videoDetails.title, url: song_info.videoDetails.video_url }
            } else{
                const videoFinder = async (query) => {
                    const videoResult = await ytSearch(query);
        
                    return (videoResult.videos.length > 1) ? videoResult.videos[0] : null;
                }
                const video = await videoFinder(args.join(' '));
                if(video){
                    songs = { title: video.title, url: video.url }
                } else {
                    message.channel.send('No video result found.');
                }
                
            }
            const song = songs.url

            await music.play({
                interaction: message,
                channel: channel,
                song: args[0]
            });
            const queue = await music.getQueue({interaction: message});
            if(queue.length > 1) return message.channel.send(`:thumbsup: Added **${songs.title}** to the queue!`);
            else return message.channel.send(`:musical_note:  Started playing **${songs.title}**!`);
        } else if(cmd === 'skip' || cmd === 's'){
            music.skip({ interaction: message });
            message.reply('Song skipped.');
            return message.channel.send(`:musical_note: Started playing **${songs.title}**!`);
        } else if(cmd === 'pause'){
            music.pause({ interaction: message });
            message.reply('Playback paused.');
        } else if(cmd === 'resume'){
            music.resume({ interaction: message });
            message.reply('Playback resumed.');
        } else if(cmd === 'stop'){
            music.stop({ interaction: message });
            message.reply('Playback stopped.');
        } else if(cmd === 'loop'){
            const loop = await music.isRepeated({interaction: message});
            music.repeat({
                interaction: message,
                value: !loop
            });
            return (!loop) ? message.reply('Now looping.') : message.reply('Stopped looping.')
        }
    }
}