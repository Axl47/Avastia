import { Command } from "../../structures/Command";
import { queue } from "../../structures/Client";
import { MessageEmbed } from "discord.js";

export default new Command({
  name: 'remove',
  description: 'Removes a song from the queue.',
  options: [
    {
      name: 'query',
      description: 'what to remove',
      type: 'STRING',
      required: true,
    },
  ],
  run: async ({ interaction }) => {
    const songQueue = queue.get(interaction!.guild!.id);
    const response = new MessageEmbed().setColor("#f22222").setDescription("Not playing anything.");

    if (songQueue) {
      let i = 0;
      let songs = songQueue.songs;
      for (i = 0; i < songs.length; i++) {
        if (songs[i].title.toLowerCase().includes(interaction.options.getString('query', true).toLowerCase())) {
          break;
        }
      }

      if (i < songQueue.songs.length) {
        response.setDescription(`Removed [${songs[i].title}](${songs[i].url}) [${interaction.user}]`);
        songQueue.songs.splice(i, 1);
      } else {
        response.setDescription("Song not in queue.");
      }
    }
    return await interaction.followUp({ embeds: [response] });
  }
});