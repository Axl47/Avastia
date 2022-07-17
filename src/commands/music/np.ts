import { Command } from "../../structures/Command";
import { queue } from "../../structures/Client";
import { MessageEmbed } from "discord.js";

export default new Command({
  name: 'now',
  description: 'Displays the current song',
  run: async ({ interaction }) => {
    const songQueue = queue.get(interaction!.guild!.id);
    const response = new MessageEmbed().setColor("#f22222");

    if (!songQueue) {
      response.setDescription("Not playing anything.");
      return interaction.followUp({ embeds: [response] });
    }

    let song = songQueue.songs[songQueue.loopCounter];
    response.
      setTitle("Now Playing...")
      .setDescription(
        `[${song.title}](${song.url}) (${song.duration}) [${interaction.user}]`
      );

    return interaction.followUp({ embeds: [response] });
  }
});
