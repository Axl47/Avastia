var exec = require('child_process').exec;

const DSTOKEN = process.env['DSTOKEN'];

const Discord = require('discord.js');
const client = new Discord.Client({
  intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_VOICE_STATES"]
});
client.options.http.api = "https://discord.com/api"

// Keep Alive maintains the replit online
const keep_alive = require('./keep_alive.js')

client.commands = new Discord.Collection();
client.events = new Discord.Collection();

['commandHandler', 'eventHandler'].forEach(handler => {
  require(`./handlers/${handler}`)(client, Discord);
})

try{
	client.login(DSTOKEN);
} catch{
	exec("kill 1");
}