const fs = require("fs");
import { Client } from 'discord.js'

module.exports = async (client: Client) => {
  const commands = fs
    .readdirSync("./commands/")
    .filter((file) => file.endsWith(".ts"));

  for (const file of commands) {
    const cmd = require(`../commands/${file}`);
    if (cmd.name) client.commands.set(cmd.name, cmd);
  }
};