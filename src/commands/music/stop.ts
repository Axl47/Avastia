import { Command } from "../../structures/Command";
import { queue } from "../../structures/Client";
import { MessageEmbed } from "discord.js";
import { playNextSong } from "../../events/player/stateChange";

export default new Command({
  name: 'stop',
  description: 'Stops the player',
  run: async ({ interaction }) => {
    const songQueue = queue.get(interaction!.guild!.id);
    const response = new MessageEmbed().setColor("#f22222").setDescription("Not playing anything.");

    if (songQueue) {
      songQueue.stopped = true;
      playNextSong();

      response.setDescription("Player stopped.");
    }

    return interaction.followUp({ embeds: [response] });
  }
});