import { Command } from "../../structures/Command";
import { queue } from "../../structures/Client";
import { MessageEmbed } from "discord.js";

import { videoPlayer } from "./play";

export default new Command({
  name: 'rewind',
  description: 'Rewinds the current song',
  run: async ({ interaction }) => {
    const songQueue = queue.get(interaction!.guild!.id);
    const response = new MessageEmbed().setColor("#f22222").setDescription("Not playing anything.");

    if (songQueue && songQueue.songs[0]) {
      await videoPlayer(interaction!.guild!.id, songQueue.songs[songQueue.loopCounter]);
      response.setDescription("Rewinded!");
    }

    return interaction.followUp({ embeds: [response] });
  }
});