const { queue } = require("./play.ts");

module.exports = {
  name: "rewind",
  aliases: ["r"],
  description: "Rewinds the song currently playing.",
  async execute(message, args, cmd, client, Discord) {
    const songQueue = queue.get(message.guild.id);
    if (!songQueue) {
      const newEmbed = new Discord.MessageEmbed()
        .setColor("#f22222")
        .setDescription("Not playing anything.");
      return message.reply({ embeds: [newEmbed] });
    }
      // try {
      //   // Play current song if there is one
      //   if (songQueue.songs[0]) {
      //     await videoPlayer(message.guild, songQueue.songs[0]);

      //     const newEmbed = new Discord.MessageEmbed()
      //       .setColor("#f22222")
      //       .setDescription("Rewinded!");
      //     return message.reply({ embeds: [newEmbed] });
          
      //   } else {
      //     const newEmbed = new Discord.MessageEmbed()
      //       .setColor("#f22222")
      //       .setDescription("This is a weird error D:");
      //     return message.reply({ embeds: [newEmbed] });
      //   }
      // } catch (err) {
      //   console.error(err);
      //   songQueue.player.stop();
      //   queue.delete(message.guild.id);
      //   return console.log("Error rewinding.");
      // }
  },
};