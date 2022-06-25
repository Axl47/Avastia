const fs = require('fs');
import { Client } from 'discord.js'

module.exports = async (client: Client) => {
  const loadDir = (dirs) => {
    const events = fs
      .readdirSync(`./events/${dirs}`)
      .filter(file => file.endsWith('.ts'));

    for (const file of events) {
      const event = require(`../events/${dirs}/${file}`);
      const eventName = file.split('.')[0];
      client.on(eventName, event.bind(null, client));
    }
  }

  ['client', 'guild'].forEach(e => loadDir(e));
}