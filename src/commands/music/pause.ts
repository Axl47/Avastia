import { Command } from "../../structures/Command";
import { queue } from "../../structures/Client";
import { MessageEmbed } from "discord.js";

export default new Command({
  name: 'pause',
  description: 'Pauses the player',
  run: async ({ interaction }) => {
    const songQueue = queue.get(interaction!.guild!.id);
    const response = new MessageEmbed().setColor("#f22222").setDescription("Not playing anything.");

    if (songQueue) {
      songQueue.player.state.status = "idle";
      response.setDescription("Playback paused.");
    }

    return interaction.followUp({ embeds: [response] });
  }
});