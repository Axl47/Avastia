import { Command } from "../../structures/Command";
import { queue } from "../../structures/Client";
import { Song } from "../../structures/Song";
import { MessageEmbed } from "discord.js";
import { PaginatedMessage } from '@sapphire/discord.js-utilities';

export default new Command({
  name: 'queue',
  description: 'Shows the current queue',
  run: async ({ interaction }) => {
    const songQueue = queue.get(interaction!.guild!.id);

    if (!songQueue) {
      const response = new MessageEmbed().setColor("#f22222")
        .setDescription("Not playing anything.");
      return interaction.followUp({ embeds: [response] });
    }

    // let format = "```autohotkey\n";
    // let songs = format;

    // for (let i = 0; i < songQueue.songs.length; i++) {
    //   // Every 25 songs send a new message
    //   if (i % 25 === 0 && i != 0) {
    //     songs += "```";
    //     interaction.followUp(songs);
    //     songs = format;
    //     if (i === songQueue.songs.length - 1) return;
    //   }
    //   songs += `${i + 1}) ${songQueue.songs[i].title} (${songQueue.songs[i].duration})\n`;
    // }
    // songs += "```";
    // return interaction.followUp(songs);

		let songs = '';

		const paginatedLyrics = new PaginatedMessage({
        template: new MessageEmbed()
          .setColor('#ff0000')
      });

		let index = 1;
		songQueue.songs.map(function(song: Song) { 
  		songs += `${index}) ${song.title} (${song.duration})\n`
			index += 1;
		});
		const songsIndex = Math.round(songs.length / 4096) + 1;
      for (let i = 1; i <= songsIndex; ++i) {
        let b = i - 1;
        if (songs.trim().slice(b * 4096, i * 4096).length !== 0) {
          paginatedLyrics.addPageEmbed(embed => {
            return embed.setDescription(songs.slice(b * 4096, i * 4096));
          });
        }
      }

      await interaction.followUp('Queue:');
      return paginatedLyrics.run(interaction);
  }
});