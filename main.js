const DSTOKEN = process.env['DSTOKEN']

const Discord = require('discord.js');
const client = new Discord.Client({
  intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_VOICE_STATES"]
});

const keep_alive = require('./keep_alive.js')

client.commands = new Discord.Collection();
client.events = new Discord.Collection();

['commandHandler', 'eventHandler'].forEach(handler => {
  require(`./handlers/${handler}`)(client, Discord);
})

client.login(DSTOKEN);
