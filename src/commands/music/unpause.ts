import { Command } from "../../structures/Command";
import { queue } from "../../structures/Client";
import { MessageEmbed } from "discord.js";

export default new Command({
  name: 'unpause',
  description: 'Unpauses the player',
  run: async ({ interaction }) => {
    const songQueue = queue.get(interaction!.guild!.id);
    const response = new MessageEmbed().setColor("#f22222");

    if (!songQueue) {
      response.setDescription("Not playing anything.");
      return interaction.followUp({ embeds: [response] });
    }

    songQueue.player.state.status = "playing";

    response.setDescription("Playback resumed.");
    return interaction.followUp({ embeds: [response] });
  }
});