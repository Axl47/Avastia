import { Command } from "../../structures/Command";
import { queue } from "../../structures/Client";
import { MessageEmbed } from "discord.js";

export default new Command({
  name: 'now',
  description: 'Displays the current song',
  run: async ({ interaction }) => {
    const songQueue = queue.get(interaction!.guild!.id);
    const response = new MessageEmbed().setColor("#f22222").setDescription("Not playing anything.");

    if (songQueue) {
      response.setTitle("Now Playing...")
        .setDescription(`[${songQueue.songs[songQueue.loopCounter].title}](${songQueue.songs[songQueue.loopCounter].url}) (${songQueue.songs[songQueue.loopCounter].duration}) [${interaction.user}]`);
    }

    return interaction.followUp({ embeds: [response] });
  }
});
