const MessageEmbed = require('discord.js');
const { queue, videoPlayer } = require('./play.js')

module.exports = {
  name: 'skip',
  aliases: ['s'],
  description: 'Skips to the next song',
  async execute(message, args, cmd, client, Discord) {
    const songQueue = queue.get(message.guild.id);
    if (!songQueue) {
      const newEmbed = new Discord.MessageEmbed()
        .setColor('#f22222')
        .setDescription('Not playing anything.');

      return message.reply({ embeds: [newEmbed] });
    }
    if (songQueue.loop) {
      songQueue.loopCounter++;
      if (songQueue.loopCounter >= songQueue.songs.length) {
        songQueue.loopCounter = 0
      }
      await videoPlayer(message.guild, songQueue.songs[songQueue.loopCounter]);
      const newEmbed = new Discord.MessageEmbed()
        .setColor('#f22222')
        .setDescription('Song skipped');

      return message.reply({ embeds: [newEmbed] });
    } else {
      try {
        if (songQueue.songs[1]) {
          songQueue.songs.shift();
          await videoPlayer(message.guild, songQueue.songs[0]);
          const newEmbed = new Discord.MessageEmbed()
            .setColor('#f22222')
            .setDescription('Song skipped');

          return message.reply({ embeds: [newEmbed] });
        } else {
          const newEmbed = new Discord.MessageEmbed()
            .setColor('#f22222')
            .setDescription('End of the queue. Use !stop to stop playback.');

          return message.reply({ embeds: [newEmbed] });
        }
      } catch (err) {
        console.error(err)
        songQueue.player.stop()
        queue.delete(message.guild.id);
        return console.log('Error skipping song.');
      }
    }
  }
}