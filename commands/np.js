const MessageEmbed = require('discord.js');
const { queue } = require('./play.js')

module.exports = {
  name: 'now',
  aliases: ['np'],
  description: 'Displays the current song',
  async execute(message, args, cmd, client, Discord) {
    const songQueue = queue.get(message.guild.id);
    
    if (!songQueue) {
      const newEmbed = new Discord.MessageEmbed()
        .setColor('#f22222')
        .setDescription('Not playing anything.');
      return message.reply({ embeds: [newEmbed] });
    }
    let loopC = songQueue.loopCounter;
    const newEmbed = new Discord.MessageEmbed()
      .setColor('#f22222')
      .setTitle('Now Playing...')
      .setDescription(`[${songQueue.songs[loopC].title}](${songQueue.songs[loopC].url}) [${message.author}]`);
    return message.reply({ embeds: [newEmbed] });
  }
}