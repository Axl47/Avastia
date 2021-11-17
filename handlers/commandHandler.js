const fs = require('fs');

module.exports = async (client, Discord) => {
    const commands = fs
        .readdirSync('./commands/')
        .filter(file => file.endsWith('.js'));

    for (const file of commands) {
        const cmd = require(`../commands/${file}`);
        if (cmd.name) {
            client.commands.set(cmd.name, cmd);
        } else {
            continue;
        }


    }
}