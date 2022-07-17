import { queue } from "../../structures/Client";
import { videoPlayer, guildId } from "../../commands/music/play";
import { PlayerEvent } from "../../structures/Event";

export default new PlayerEvent("idle", async () => {
    playNextSong();
});

export const playNextSong = async () => {
    const songQueue = queue.get(guildId);
    if (!songQueue) {
        console.log("No song queue");
        return;
    }

    try {
        if (songQueue.loop) {
            songQueue.loopCounter++;
            if (songQueue.loopCounter >= songQueue.songs.length) songQueue.loopCounter = 0;

            videoPlayer(guildId, songQueue.songs[songQueue.loopCounter]);
            return;
        } else {
            songQueue.songs.shift();

            if (songQueue.songs.length) videoPlayer(guildId, songQueue.songs[0]);
            else if (!songQueue.stopped) {
                await songQueue.connection?.destroy();
                queue.delete(guildId);
            }
        }
    } catch (err) {
        console.error(err);
        songQueue.connection?.destroy();
        queue.delete(guildId);
        return;
    }
};
