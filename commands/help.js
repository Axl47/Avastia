const MessageEmbed = require('discord.js');

module.exports = {
    name: 'help',
    aliases: ['h'],
    description: 'Clears x number of messages',
    async execute(message, args, cmd, client, Discord){
        if(cmd === 'help' || cmd === 'h'){
            const newEmbed = new Discord.MessageEmbed()
                .setColor('#15b500')
                .setTitle('Commands:')
                .setDescription('All available commands...')
                .addFields(
                    { name: '!image', value: 'Searches the value on Google and sends an image to the channel.', inline: true },
                    { name: '!wao, !w', value: 'Sends a random dog picture to the channel.', inline: true },
                    { name: '\u200B', value: '\u200B' },
                    { name: '!play, !p', value: 'Searches on Youtube or Spotify and plays the result.', inline: true },
                    { name: '!skip, !s', value: 'Skips to the next song.', inline: true },
                    { name: '\u200B', value: '\u200B' },
                    { name: '!pause', value: 'Pauses the player.', inline: true },
                    { name: '!unpause, !resume', value: 'Unpauses the player.', inline: true },
                    { name: '\u200B', value: '\u200B' },
                    { name: '!stop', value: 'Disconnects the player and clears the queue.', inline: true },
                    { name: '!loop', value: 'Toogles looping the queue.', inline: true },
                    { name: '\u200B', value: '\u200B' },
                    { name: '!now playing, !np', value: 'Sends the song currently playing.', inline: true },
                    { name: '!shuffle', value: 'Shuffles the queue.', inline: true },
                    { name: '\u200B', value: '\u200B' },
                    { name: '!queue', value: 'Sends the queue to the channel.', inline: true },
                    { name: '!clear, !delete, !c', value: 'Clears x amount of messages from the channel if they are not older than 14 days.', inline: true },
                    { name: '\u200B', value: '\u200B' },
                    { name: '!jump', value: 'Jumps x songs.', inline: true },
                );
            
            return message.reply({ embeds: [newEmbed] });
        }
    }
}