const { queue } = require("./play.ts");

module.exports = {
  name: "loop",
  description: "Loops the queue",
  async execute(message, args, cmd, client, Discord) {
    const songQueue = queue.get(message.guild.id);

    if (!songQueue) {
      const newEmbed = new Discord.MessageEmbed()
        .setColor("#f22222")
        .setDescription("Not playing anything.");
      return message.reply({ embeds: [newEmbed] });
    }

    songQueue.loop = !songQueue.loop;

    if (!songQueue.loop) songQueue.loopCounter = 0;
    const newEmbed = new Discord.MessageEmbed()
      .setColor("#f22222")
      .setDescription(songQueue.loop ? "Now looping." : "Stopped looping.");
    return message.reply({ embeds: [newEmbed] });
  },
};
