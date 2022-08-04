import { queue } from "../../structures/Client";
import { guildId, channel, author, videoPlayer } from "../../commands/music/play";
import { PlayerEvent } from "../../structures/Event";
import { MessageEmbed } from "discord.js";

export default new PlayerEvent("stateChange", async () => {
    const songQueue = queue.get(guildId);
    if (!songQueue) return;

    switch (songQueue.player.state.status) {
        case "playing":
            const play = new MessageEmbed()
                .setColor("#f22222")
                .setDescription(`Started playing [${songQueue.songs[songQueue.loopCounter].title}](${songQueue.songs[songQueue.loopCounter].url}) (${songQueue.songs[songQueue.loopCounter].duration}) [${author}]`);
            return channel.send({ embeds: [play] });
        case "idle":
            playNextSong();
            break;
        default:
            return;
    }
});

export const playNextSong = async () => {
    const songQueue = queue.get(guildId);
    if (!songQueue) return;
    if (songQueue.stopped) {
        if (songQueue.connection) await songQueue.connection.destroy();
        return queue.delete(guildId);
    }

    if (songQueue.loop) {
        songQueue.loopCounter++;
        if (songQueue.loopCounter >= songQueue.songs.length) songQueue.loopCounter = 0;
    } else {
        await songQueue.songs.shift();
    }

    if (songQueue.songs[0]) {
        return videoPlayer(guildId, songQueue.songs[songQueue.loopCounter]);
    } else {
        if (songQueue.connection) await songQueue.connection.destroy();
        queue.delete(guildId);
    }
};