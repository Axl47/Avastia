import { Command } from "../../structures/Command";
import { queue } from "../../structures/Client";
import { MessageEmbed } from "discord.js";
import { videoPlayer } from "./play";

export default new Command({
    name: 'seek',
    description: 'Seeks the current song to the specified second',
    options: [
        {
            name: 'second',
            description: 'amount to seek to',
            type: 'INTEGER',
            required: true,
        }
    ],
    run: async ({ interaction }) => {
        let amount = interaction.options.getInteger('second', true);

        const songQueue = queue.get(interaction.guild?.id);
        const response = new MessageEmbed().setColor("#f22222").setDescription("Not playing anything.");

        if (songQueue) {
            await videoPlayer(interaction.guild!.id, songQueue.songs[songQueue.loopCounter], amount);
            if (songQueue.songs[songQueue.loopCounter] > amount) response.setDescription(`Seeked to ${amount}s!`);
            else response.setDescription("Excedeed song duration, skipping...");
        }

        return interaction.followUp({ embeds: [response] });
    }
});