const { queue } = require("./play.ts");

module.exports = {
  name: "skip",
  aliases: ["s"],
  description: "Skips to the next song",
  async execute(message, args, cmd, client, Discord) {
    const songQueue = queue.get(message.guild.id);
    if (!songQueue) {
      const newEmbed = new Discord.MessageEmbed()
        .setColor("#f22222")
        .setDescription("Not playing anything.");
      return message.reply({ embeds: [newEmbed] });
    }

		songQueue.skip = true;
		songQueue.player.state.status = "idle";
		
		/*
    if (songQueue.loop) {
      songQueue.loopCounter++;
      if (songQueue.loopCounter >= songQueue.songs.length)
        songQueue.loopCounter = 0;

      await videoPlayer(message.guild, songQueue.songs[songQueue.loopCounter]);

      const newEmbed = new Discord.MessageEmbed()
        .setColor("#f22222")
        .setDescription("Song skipped");
      return message.reply({ embeds: [newEmbed] });
    } else {
      try {
        // Play next song if there is one
        if (songQueue.songs[1]) {
          songQueue.songs.shift();
          await videoPlayer(message.guild, songQueue.songs[0]);

          const newEmbed = new Discord.MessageEmbed()
            .setColor("#f22222")
            .setDescription("Song skipped");
          return message.reply({ embeds: [newEmbed] });
          
        } else {
					// Disconnect if there isn't a next song
          songQueue.stopped = true;
          songQueue.loop = false;

          try {
            songQueue.connection?.destroy();
          } catch(err) {
            console.error(err);
          }

          queue.delete(message.guild.id);
          songQueue.player.state.status = "idle";

          const newEmbed = new Discord.MessageEmbed()
            .setColor("#f22222")
            .setDescription("End of the queue. Disconnecting...");
          return message.reply({ embeds: [newEmbed] });
        }
      } catch (err) {
        console.error(err);
        songQueue.player.stop();
        queue.delete(message.guild.id);
        return console.log("Error skipping song.");
      }
    }
		*/
  },
};