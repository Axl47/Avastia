import { Command } from "../../structures/Command";
import { queue } from "../../structures/Client";
import { MessageEmbed } from "discord.js";

import { videoPlayer } from "./play";

export default new Command({
  name: 'jump',
  description: 'Jumps X songs.',
  options: [
    {
      name: 'amount',
      description: 'Amount to skip.',
      type: 'NUMBER',
      required: true,
    }
  ],
  run: async ({ interaction }) => {
    const songQueue = queue.get(interaction!.guild!.id);
    const response = new MessageEmbed().setColor("#f22222").setDescription("Not playing anything.");

    if (songQueue) {
      const amount = interaction.options.getNumber('amount', true);
      if (songQueue.loop || songQueue.songs.length >= amount) {
        if (songQueue.songs.length < amount + songQueue.loopCounter) {
          let n = amount;
          while (n) {
            songQueue.loopCounter++;
            if (songQueue.loopCounter >= songQueue.songs.length)
              songQueue.loopCounter = 0;
            n--;
          }
        } else {
          songQueue.loopCounter += amount;
        }
        await videoPlayer(interaction!.guild!.id, songQueue.songs[songQueue.loopCounter]);
        response.setDescription(`Jumped **${amount}** songs.`);
      } else {
        response
          .setTitle("Cannot jump that many songs.")
          .setDescription(`Queue length is ${songQueue.songs.length}.`);
      }
    }
    return interaction.followUp({ embeds: [response] });
  }
});