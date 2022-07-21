import { Command } from "../../structures/Command";
import { queue } from "../../structures/Client";
import { MessageEmbed } from "discord.js";
import { GeniusLyrics } from 'genius-discord-lyrics';
import { PaginatedMessage } from '@sapphire/discord.js-utilities';

const genius = new GeniusLyrics(process.env.geniusKey!);

export default new Command({
  name: 'lyrics',
  description: 'Sends the lyrics of the current song',
  options: [
    {
      name: 'title',
      description: 'song to search',
      type: 'STRING',
      required: false,
    }
  ],
  run: async ({ interaction }) => {
    let title = interaction.options.getString('title');

    if (!title) {
      const songQueue = queue.get(interaction!.guild!.id);
      if (songQueue) {
        title = songQueue.songs[0].title;
      } else {
        const response = new MessageEmbed().setColor("#ff0000").setDescription("Provide a title or start playing something.");
        return await interaction.followUp({ embeds: [response] });
      }
    }

    try {
      const lyrics = (await genius.fetchLyrics(title!)) as string;
      const lyricsIndex = Math.round(lyrics.length / 4096) + 1;
      const paginatedLyrics = new PaginatedMessage({
        template: new MessageEmbed()
          .setColor('#ff0000')
          .setTitle(title!)
          .setFooter({
            text: 'Provided by genius.com',
            iconURL:
              'https://assets.genius.com/images/apple-touch-icon.png?1652977688' // Genius Lyrics Icon
          })
      });

      for (let i = 1; i <= lyricsIndex; ++i) {
        let b = i - 1;
        if (lyrics.trim().slice(b * 4096, i * 4096).length !== 0) {
          paginatedLyrics.addPageEmbed(embed => {
            return embed.setDescription(lyrics.slice(b * 4096, i * 4096));
          });
        }
      }

      await interaction.followUp('Lyrics generated');
      return paginatedLyrics.run(interaction);
    } catch (e) {
      console.log(e);
      return await interaction.followUp('Something went wrong :(');
    }
  }
});