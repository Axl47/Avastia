import { AudioPlayer, VoiceConnection } from "@discordjs/voice";
import { TextBasedChannel, VoiceBasedChannel } from "discord.js";
import { QueueType } from "../typings/Queue"
import { Song } from "./Song";

export class Queue {
    voiceChannel: VoiceBasedChannel;
    textChannel: TextBasedChannel;
    connection: VoiceConnection;
    player: AudioPlayer | null;
    songs: Song[];
    stopped: boolean;
    loop: boolean;
    loopCounter: number;
    constructor({ voiceChannel, textChannel, connection, player, songs, stopped, loop, loopCounter }: QueueType) {
        this.voiceChannel = voiceChannel;
        this.textChannel = textChannel;
        this.connection = connection;
        this.player = player;
        this.songs = songs;
        this.stopped = stopped;
        this.loop = loop;
        this.loopCounter = loopCounter;
    }
}