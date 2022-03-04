const { queue } = require("./play.js");

module.exports = {
  name: "now",
  aliases: ["np"],
  description: "Displays the current song",
  async execute(message, args, cmd, client, Discord) {
    const songQueue = queue.get(message.guild.id);

    if (!songQueue) {
      const newEmbed = new Discord.MessageEmbed()
        .setColor("#f22222")
        .setDescription("Not playing anything.");
      return message.reply({ embeds: [newEmbed] });
    }

    let song = songQueue.songs[songQueue.loopCounter];
    const newEmbed = new Discord.MessageEmbed()
      .setColor("#f22222")
      .setTitle("Now Playing...")
      .setDescription(
        `[${song.title}](${song.url}) (${song.duration}) [${message.author}]`
      );
    return message.reply({ embeds: [newEmbed] });
  },
};