module.exports = {
  name: "coin",
  description: "Cara o Cruz",
  async execute(message, args, cmd, client, Discord) {

    let coin = Math.floor(Math.random() * 2);
    const newEmbed = new Discord.MessageEmbed()
      .setColor("#f22222")
      .setDescription(`Y el resultado es... **${(coin == 0) ? 'Cara' : 'Cruz'}**`);
    return message.reply({ embeds: [newEmbed] });
  },
};