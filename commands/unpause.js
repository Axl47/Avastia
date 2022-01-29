const MessageEmbed = require('discord.js');
const { queue } = require('./play.js')

module.exports = {
  name: 'unpause',
  aliases: ['resume'],
  description: 'Unpauses the player',
  async execute(message, args, cmd, client, Discord) {
    const songQueue = queue.get(message.guild.id);
    if (!songQueue) {
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
  }
}