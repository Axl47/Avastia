module.exports = {
  name: 'clear',
  aliases: ['c', 'delete'],
  description: 'Clears x number of messages',
  async execute(message, args) {
    // Manage bad input
    if (!args[0]) return message.reply(`Please enter the amount to clear ${message.author}!`);
    if (isNaN(args[0])) return message.reply(`Please enter a real number ${message.author}!`);
    if (args[0] > 100) return message.reply(`You cannot delete more than 100 messages ${message.author}!`);
    if (args[0] < 1) return message.reply(`You must delete at least one message ${message.author}!`);

    try {
      await message.channel.messages
        .fetch({ limit: args[0] })
        .then(messages => {
          message.channel.bulkDelete(messages);
        });
    } catch {
      return message.reply("You cannot delete messages older than 14 days!");
    }
  }
}