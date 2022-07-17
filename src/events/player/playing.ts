import { queue } from "../../structures/Client";
import { guildId, channel, author } from "../../commands/music/play";
import { PlayerEvent } from "../../structures/Event";
import { MessageEmbed } from "discord.js";

export default new PlayerEvent("playing", async () => {
    const songQueue = queue.get(guildId);
    if (!songQueue) {
        console.log("No song queue");
        return;
    }

    songQueue.stopped = false;
    try {
        const play = new MessageEmbed()
            .setColor("#f22222")
            .setDescription(`Started playing [${songQueue.songs[songQueue.loopCounter].title}](${songQueue.songs[songQueue.loopCounter].url}) [${author}]`);
        return channel.send({ embeds: [play] });

    } catch (err) {
        console.log(err);
        channel.send("Error playing.")
        return queue.delete(guildId);
    }
});