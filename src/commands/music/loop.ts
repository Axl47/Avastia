import { Command } from "../../structures/Command";
import { queue } from "../../structures/Client";
import { MessageEmbed } from "discord.js";

export default new Command({
  name: 'loop',
  description: 'Loops the queue',
  run: async ({ interaction }) => {
    const songQueue = queue.get(interaction!.guild!.id);
    const response = new MessageEmbed().setColor("#f22222").setDescription("Not playing anything.");

    if (songQueue) {
      songQueue.loop = !songQueue.loop;
      songQueue.loopCounter = 0;
      response.setDescription(songQueue.loop ? "Now looping." : "Stopped looping.");
    }

    return interaction.followUp({ embeds: [response] });
  }
});
