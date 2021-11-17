const MessageEmbed = require('discord.js');

module.exports = {
    name: 'pegarle',
    aliases: ['beso'],
    description: 'Clears x number of messages',
    async execute(message, args, cmd, client, Discord){
        if(cmd === 'pegarle'){
            const newEmbed = new Discord.MessageEmbed()
                .setColor('#15b500')
                .setDescription(`${message.author} y Avastia le pegan a ${args[0]}`);

            return message.reply({ embeds: [newEmbed] })
        } else if(cmd === 'beso'){
            const newEmbed = new Discord.MessageEmbed()
                .setColor('#15b500')
                .setDescription(`${message.author} besa a ${args[0]}`);

            return message.reply({ embeds: [newEmbed] })
        }
    }
}