import { Command } from "../../structures/Command";
import { queue } from "../../structures/Client";
import { MessageEmbed } from "discord.js";
import { playNextSong } from "../../events/player/idle";

export default new Command({
  name: 'skip',
  description: 'Skips to the next song',
  run: async ({ interaction }) => {
    const songQueue = queue.get(interaction!.guild!.id);
    const response = new MessageEmbed().setColor("#f22222");

    if (!songQueue) {
      response.setDescription("Not playing anything.");
      return interaction.followUp({ embeds: [response] });
    }

    songQueue.player.state.status = "idle";
    await playNextSong();

    response.setDescription("Song skipped.");
    return interaction.followUp({ embeds: [response] });
  }
});