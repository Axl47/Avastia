import { ApplicationCommandDataResolvable, Client, ClientEvents, Collection } from 'discord.js'
import { CommandType } from '../typings/Command';
import { Event, PlayerEvent } from './Event';
import glob from 'glob';
import { promisify } from 'util';
import { RegisterCommandOptions } from '../typings/Client';

export const queue = new Map();
const globPromise = promisify(glob);

export class SuperClient extends Client {
    commands: Collection<string, CommandType> = new Collection();

    constructor() {
        super({ intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_VOICE_STATES"] })
    }

    start() {
        this.registerModules()
        this.login(process.env.DSTOKEN)
    }

    async importFile(filePath: string) {
        return (await import(filePath))?.default;
    }

    async registerCommands({ commands, guildId }: RegisterCommandOptions) {
        if (guildId) {
            this.guilds.cache.get(guildId)?.commands.set(commands);
            console.log("Registering commands to guild.")
        } else {
            this.application?.commands.set(commands);
            console.log("Global registering")
        }
    }

    async registerModules() {
        // commands
        const slashCommands: ApplicationCommandDataResolvable[] = [];
        const commandFiles = await globPromise(`${__dirname}/../commands/*/*{.ts,.js}`);
        commandFiles.forEach(async filePath => {
            const command: CommandType = await this.importFile(filePath);
            if (!command.name) return;

            this.commands.set(command.name, command);
            slashCommands.push(command);
        })

        this.on("ready", () => {
            this.registerCommands({
                commands: slashCommands,
                guildId: process.env.guildId
            });
        });

        // events
        const eventFiles = await globPromise(`${__dirname}/../events/*{.ts,.js}`);
        eventFiles.forEach(async filePath => {
            const event: Event<keyof ClientEvents> = await this.importFile(filePath);
            this.on(event.event, event.run);
        })
    }

    async playerEvents(guildId: string) {
        const songQueue = await queue.get(guildId);
        const eventFiles = await globPromise(`${__dirname}/../events/player/*{.ts,.js}`);
        eventFiles.forEach(async filePath => {
            const event: PlayerEvent = await this.importFile(filePath);
            songQueue.player.on(event.event, event.run);
        })
    }
}