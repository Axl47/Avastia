import { queue } from "../../structures/Client";
import { videoPlayer, guildId } from "../../commands/music/play";
import { PlayerEvent } from "../../structures/Event";

export default new PlayerEvent("idle", async () => {
    playNextSong();
});

export const playNextSong = async () => {
    const songQueue = queue.get(guildId);
    if (!songQueue) return;
    if (songQueue.stopped) {
        if (songQueue.connection) songQueue.connection.destroy();
        return queue.delete(guildId);
    }

    if (songQueue.loop) {
        songQueue.loopCounter++;
        if (songQueue.loopCounter >= songQueue.songs.length) songQueue.loopCounter = 0;
    } else {
        songQueue.songs.shift();
    }

    if (songQueue.songs) {
        return videoPlayer(guildId, songQueue.songs[songQueue.loopCounter]);
    } else {
			if (songQueue.connection) {
				await songQueue.connection.destroy();
			}
			queue.delete(guildId);
		}
};
