import { Command } from "../../structures/Command";
import { queue } from "../../structures/Client";
import { MessageEmbed } from "discord.js";

import { videoPlayer } from "./play";

export default new Command({
  name: 'rewind',
  description: 'Rewinds the current song',
  run: async ({ interaction }) => {
    const songQueue = queue.get(interaction!.guild!.id);
    const response = new MessageEmbed().setColor("#f22222");

    if (!songQueue) {
      response.setDescription("Not playing anything.");
      return interaction.followUp({ embeds: [response] });
    }

    try {
      // Play current song if there is one
      if (songQueue.songs[0]) {
        await videoPlayer(interaction!.guild!.id, songQueue.songs[songQueue.loopCounter]);

        response.setDescription("Rewinded!");
      }
    } catch (err) {
      console.error(err);
      songQueue.player.stop();
      queue.delete(interaction!.guild!.id);
      response.setDescription("Error rewinding.");
    }

    return interaction.followUp({ embeds: [response] });
  }
});