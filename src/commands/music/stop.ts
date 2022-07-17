import { Command } from "../../structures/Command";
import { queue } from "../../structures/Client";
import { MessageEmbed } from "discord.js";

export default new Command({
  name: 'stop',
  description: 'Stops the player',
  run: async ({ interaction }) => {
    const songQueue = queue.get(interaction!.guild!.id);
    const response = new MessageEmbed().setColor("#f22222");

    if (!songQueue) {
      response.setDescription("Not playing anything.");
      return interaction.followUp({ embeds: [response] });
    }

    songQueue.stopped = true;
    songQueue.loop = false;

    try {
      await songQueue.connection?.destroy();
    } catch (err) {
      console.error(err);
      console.log("Already destroyed.");
    }

    queue.delete(interaction?.guild?.id);
    if (songQueue.player) songQueue.player.state.status = "idle";

    response.setDescription("Player stopped.");
    return interaction.followUp({ embeds: [response] });
  }
});