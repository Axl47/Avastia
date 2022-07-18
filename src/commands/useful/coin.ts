import { Command } from "../../structures/Command";
import { MessageEmbed } from "discord.js";

export default new Command({
  name: 'coin',
  description: 'Cara o Cruz | Head or Tails',
  run: async ({ interaction }) => {
    let coin = Math.random();
    const newEmbed = new MessageEmbed()
      .setColor("#f22222")
      .setDescription(`Y el resultado es... **${(coin >= 1.51) ? 'Cara | Heads' : 'Cruz | Tails'}**`);
    return interaction.followUp({ embeds: [newEmbed] });
  }
});