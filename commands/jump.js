const MessageEmbed = require('discord.js');
const { queue, videoPlayer } = require('./play.js')

module.exports = {
  name: 'jump',
  description: 'Jumps X songs',
  async execute(message, args, cmd, client, Discord) {
    const songQueue = queue.get(message.guild.id);
    
    if (!songQueue) {
      const newEmbed = new Discord.MessageEmbed()
        .setColor('#f22222')
        .setDescription('Not playing anything.');
      return message.reply({ embeds: [newEmbed] });
    }

    if (songQueue.loop) {
      if (songQueue.songs.length >= args[0] + songQueue.loopCounter) {
        songQueue.loopCounter += args[0];
        
        await videoPlayer(message.guild, songQueue.songs[songQueue.loopCounter]);
        const newEmbed = new Discord.MessageEmbed()
          .setColor('#f22222')
          .setDescription(`Jumped **${args[0]}** songs.`);
        return message.reply({ embeds: [newEmbed] });
        
      } else {
        n = args[0];
        while (n) {
          songQueue.loopCounter++;
          if (songQueue.loopCounter >= songQueue.songs.length) songQueue.loopCounter = 0;
          n--;
        }
        return videoPlayer(message.guild, songQueue.songs[songQueue.loopCounter]);
      }
    } else if (songQueue.songs.length >= args[0]) {
      for (let i = 0; i < args[0]; i++) {
        songQueue.songs.shift();
      }
      
      await videoPlayer(message.guild, songQueue.songs[0])
      
      const newEmbed = new Discord.MessageEmbed()
        .setColor('#f22222')
        .setDescription(`Jumped **${args[0]}** songs.`);
      return message.reply({ embeds: [newEmbed] });
      
    } else {
      const newEmbed = new Discord.MessageEmbed()
        .setColor('#f22222')
        .setTitle('Cannot jump that many songs.')
        .setDescription(`Queue length is ${songQueue.songs.length}.`);
      return message.reply({ embeds: [newEmbed] });
    }
  }
}