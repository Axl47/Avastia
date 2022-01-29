const MessageEmbed = require('discord.js');
const { queue } = require('./play.js')

module.exports = {
  name: 'stop',
  description: 'Stops playback',
  async execute(message, args, cmd, client, Discord) {
    const songQueue = queue.get(message.guild.id);
    if (!songQueue) {
      const newEmbed = new Discord.MessageEmbed()
        .setColor('#f22222')
        .setDescription('Not playing anything.');

      return message.reply({ embeds: [newEmbed] });
    }
    songQueue.stopped = true;
    songQueue.loop = false;
    try {
      songQueue.connection ?.destroy();
    } catch {
      console.log('Already destroyed.');
    }
    queue.delete(message.guild.id);
    songQueue.player.state.status = 'idle';
    const newEmbed = new Discord.MessageEmbed()
      .setColor('#f22222')
      .setDescription('Player stopped.');

    return message.reply({ embeds: [newEmbed] });

  }
}