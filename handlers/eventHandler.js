const fs = require('fs');

module.exports = async (client, Discord) => {
  const loadDir = (dirs) => {
    const events = fs
      .readdirSync(`./events/${dirs}`)
      .filter(file => file.endsWith('.js'));

    for (const file of events) {
      const event = require(`../events/${dirs}/${file}`);
      const eventName = file.split('.')[0];
      client.on(eventName, event.bind(null, client, Discord));
    }
  }

  ['client', 'guild'].forEach(e => loadDir(e));
}