const MessageEmbed = require('discord.js');
const { queue } = require('./play.js')

module.exports = {
  name: 'queue',
  description: 'Shows the current queue',
  async execute(message, args, cmd, client, Discord) {
    const songQueue = queue.get(message.guild.id);
    if (!songQueue) {
      const newEmbed = new Discord.MessageEmbed()
        .setColor('#f22222')
        .setDescription('Not playing anything.');
      return message.reply({ embeds: [newEmbed] });
    }
    
    let format = "```rust\n"
    let songs = format // Setting the format
    
    for (let i = 0; i < songQueue.songs.length; i++) {
      if (i % 25 === 0 && i != 0) {
        songs += "```";
        message.channel.send(songs);
        songs = format
        if (i === songQueue.songs.length - 1) return;
      }
      songs += `${i + 1}) ${songQueue.songs[i].title}\n`;
    }
    songs += "```";
    return message.channel.send(songs);
  }
}