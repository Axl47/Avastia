import { search } from "play-dl";
import { MessageEmbed, User } from "discord.js";
import { MessagePrompter } from "@sapphire/discord.js-utilities"

import { Command } from "../../structures/Command";
import { queue } from "../../structures/Client";
import { Song } from "../../structures/Song";
import { createQueue, videoPlayer, initiateEvents } from "./play"

export default new Command({
    name: 'search',
    description: 'Searches in youtube for a song',
    options: [
        {
            name: 'query',
            description: 'Search term',
            type: 'STRING',
            required: true,
        },
    ],
    run: async ({ interaction }) => {
        const response = new MessageEmbed().setColor("#15b500").setDescription('');

        if (!interaction.member.voice.channel) {
            response.setDescription(`You need to be in a voice channel to execute this command ${interaction.user}!`);
            return await interaction.followUp({ embeds: [response] });
        }

        const voiceChannel = interaction.guild?.voiceStates.cache.get(
            interaction.user.id
        )?.channel;

        if (!voiceChannel) return interaction.followUp("Error while getting voice channel.");
        if (!interaction.channel) return interaction.followUp("Error while getting text channel.");


        if (!queue.get(interaction.member.guild.id)) {
            createQueue(voiceChannel, interaction.channel, interaction);
        }

        const songQueue = queue.get(interaction.member.guild.id);
        let query = interaction.options.getString('query', true);

        const yt_info = await search(query, { limit: 5 });
        let videos = "";
        let index = 1;
        yt_info.forEach(video => {
            videos += `${index}) [${video.title ?? "Untitled"}](${video.url})\n`;
            index++;
        });
        response.setDescription(videos);
        interaction.followUp({ embeds: [response] });

        const handler = new MessagePrompter('Play which one?', 'number', {
            start: 1,
            end: 6,
            timeout: 15000
        });
        let result = await handler.run(interaction.channel, interaction.user as User);
        let first = (songQueue.songs.length) ? false : true;

        if (typeof result === "number") {
            result--;

            const song: Song = {
                title: yt_info[result].title ?? "Untitled",
                url: yt_info[result].url,
                duration: yt_info[result].durationRaw,
                durationSec: yt_info[result].durationInSec,
            };

            songQueue.songs.push(song);
            response.setDescription(`Queued [${songQueue.songs.at(-1).title}](${songQueue.songs.at(-1).url}) [${interaction.user}]`);
            interaction.channel.send({ embeds: [response] })

            if (first) {
                await videoPlayer(interaction.member.guild.id, songQueue.songs[0]);
                initiateEvents(interaction.member.guild.id);
            }
        } else {
            return;
        }
    }
});
