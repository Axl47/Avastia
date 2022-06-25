var exec = require('child_process').exec;

const DSTOKEN = process.env['DSTOKEN'];

import { Client, Collection, Command } from 'discord.js'
//import "discord.d.ts";

class SuperClient extends Client {

     public commands: Collection<string, any>;
     public events: Collection<string, any>;

     constructor(){
          super({intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_VOICE_STATES"]});
          this.commands = new Collection();
          this.events = new Collection();
     }
}

const client = new SuperClient();

client!.options.http.api = "https://discord.com/api"

// Keep Alive maintains the replit online
const keep_alive = require('./keep_alive')

client.commands = new Collection();
client.events = new Collection();

['commandHandler', 'eventHandler'].forEach(handler => {
  require(`./handlers/${handler}`)(client);
})

try{
	(async () => {
  	await client.login(DSTOKEN);
	})();
} catch{
	exec("kill 1");
}