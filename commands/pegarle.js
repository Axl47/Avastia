const MessageEmbed = require('discord.js');

module.exports = {
  name: 'pegarle',
  aliases: ['beso', 'chales', 'tliste', 'kuwai', 'kurito', 'alysita'],
  description: 'random.',
  async execute(message, args, cmd, client, Discord) {
    if (cmd === 'pegarle') {
      const newEmbed = new Discord.MessageEmbed()
        .setColor('#15b500')
        .setDescription(`${message.author} y Avastia le pegan a ${args[0]}`);

      return message.reply({ embeds: [newEmbed] })
    } else if (cmd === 'beso') {
      const newEmbed = new Discord.MessageEmbed()
        .setColor('#15b500')
        .setDescription(`${message.author} besa a ${args[0]}`);

      return message.reply({ embeds: [newEmbed] })
    } else if (cmd === 'chales') {
      const newEmbed = new Discord.MessageEmbed()
        .setColor('#15b500')
        .setDescription(`Aly es Pulga Chales.`);

      return message.reply({ embeds: [newEmbed] })
    } else if (cmd === 'tliste' || cmd === 'kuwai') {
      let x = (cmd === 'tliste') ? 'Tliste' : 'Kuwai';
      const newEmbed = new Discord.MessageEmbed()
        .setColor('#15b500')
        .setDescription(`Kuro es Pulga ${x}.`);

      return message.reply({ embeds: [newEmbed] })
    } else if (cmd === "kurito" || cmd == "alysita"){
      let x = (cmd === "kurito") ? 'Kurito es de Aly' : 'Alysita es de Kuro'
      const newEmbed = new Discord.MessageEmbed()
        .setColor('#15b500')
        .setDescription(`${x}!`);

      return message.reply({ embeds: [newEmbed] })
    }
  }
}