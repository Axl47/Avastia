import { AudioPlayer, VoiceConnection } from "@discordjs/voice";
import { TextBasedChannel, VoiceBasedChannel } from "discord.js";
import { Song } from "../structures/Song";

export interface QueueType {
    voiceChannel: VoiceBasedChannel;
    textChannel: TextBasedChannel;
    connection: VoiceConnection;
    player: AudioPlayer | null;
    songs: Song[];
    stopped: boolean;
    loop: boolean;
    loopCounter: number;
}