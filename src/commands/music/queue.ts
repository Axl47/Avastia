import { Command } from "../../structures/Command";
import { queue } from "../../structures/Client";
import { MessageEmbed } from "discord.js";

export default new Command({
  name: 'queue',
  description: 'Shows the current queue',
  run: async ({ interaction }) => {
    const songQueue = queue.get(interaction!.guild!.id);

    if (!songQueue) {
      const response = new MessageEmbed().setColor("#f22222")
        .setDescription("Not playing anything.");
      return interaction.followUp({ embeds: [response] });
    }

    let format = "```autohotkey\n";
    let songs = format; // Setting the format

    for (let i = 0; i < songQueue.songs.length; i++) {
      if (i % 25 === 0 && i != 0) {
        songs += "```";
        interaction.followUp(songs);
        songs = format;
        if (i === songQueue.songs.length - 1) return;
      }
      songs += `${i + 1}) ${songQueue.songs[i].title} (${songQueue.songs[i].duration})\n`;
    }
    songs += "```";
    return interaction.followUp(songs);
  }
});