const { queue } = require("./play.js");

module.exports = {
  name: "remove",
  description: "Removes song from queue",
  async execute(message, args, cmd, client, Discord) {
    const songQueue = queue.get(message.guild.id);
    if (!songQueue) {
      const newEmbed = new Discord.MessageEmbed()
        .setColor("#f22222")
        .setDescription("Not playing anything.");
      return message.reply({ embeds: [newEmbed] });
    }

    if (!args[0])
      return message.reply(`Please enter song to remove ${message.author}!`);

    // Text Search
    if (isNaN(args[0])) {
      var index = -1;

      for (i = 0; i < songQueue.songs.length; i++) {
        if (
          songQueue.songs[i].title
            .toLowerCase()
            .includes(args.join(" ").toLowerCase())
        ) {
          index = i;
          break;
        }
      }
      if (index < 0) return message.reply("Song not in queue.");
    }
    // Index Search
    else {
      if (args[0] > songQueue.songs.length)
        return message.reply(
          `There are less songs than ${args[0]} ${message.author}!`
        );
      if (args[0] < 1)
        return message.reply(`No negative numbers ${message.author}!`);
      var index = args[0] - 1;
    }

    const newEmbed = new Discord.MessageEmbed()
      .setColor("#f22222")
      .setDescription(`Removed [${songQueue.songs[index].title}](${songQueue.songs[index].url}) [${message.author}]`);

		songQueue.songs.splice(index, 1);
    return message.reply({ embeds: [newEmbed] });
  },
};
