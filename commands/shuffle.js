const MessageEmbed = require('discord.js');
const { queue } = require('./play.js')

module.exports = {
  name: 'shuffle',
  description: 'Shuffles the queue',
  async execute(message, args, cmd, client, Discord) {
    const songQueue = queue.get(message.guild.id);
    if (!songQueue) {
      const newEmbed = new Discord.MessageEmbed()
        .setColor('#f22222')
        .setDescription('Not playing anything.');
      return message.reply({ embeds: [newEmbed] });
    }
    
    await shuffle(songQueue.songs);
    const newEmbed = new Discord.MessageEmbed()
      .setColor('#f22222')
      .setDescription('Queue shuffled.');
    return message.reply({ embeds: [newEmbed] });
  }
}

function shuffle(queue) {
  x = queue.shift()
  let currentIndex = queue.length, randomIndex;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [queue[currentIndex], queue[randomIndex]] = [
      queue[randomIndex], queue[currentIndex]];
  }
  queue.unshift(x)
  return queue;
}