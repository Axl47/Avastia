import { Command } from "../../structures/Command";
import { queue } from "../../structures/Client";
import { MessageEmbed } from "discord.js";
import { Song } from "../../structures/Song";

export default new Command({
  name: 'shuffle',
  description: 'Shuffles the queue.',
  run: async ({ interaction }) => {
    const songQueue = queue.get(interaction.guild?.id);
    const response = new MessageEmbed().setColor("#f22222").setDescription("Not playing anything.");

    if (songQueue) {
      shuffle(songQueue.songs);
      response.setDescription("Queue shuffled.");
    }

    return interaction.followUp({ embeds: [response] });
  }
});

const shuffle = (queue: Song[]) => {
  let firstSong = queue.shift();
  let currentIndex = queue.length;
  let randomIndex: number;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [queue[currentIndex], queue[randomIndex]] = [
      queue[randomIndex],
      queue[currentIndex],
    ];
  }
  queue.unshift(firstSong!);
  return queue;
}