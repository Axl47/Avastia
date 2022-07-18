import { Command } from "../../structures/Command";
import { MessageEmbed } from "discord.js";

export default new Command({
  name: 'random',
  description: 'Diferent random messages',
  options: [
    {
      name: 'beso',
      description: 'Besar a alguien',
      type: 'SUB_COMMAND',
      options: [
        {
          name: 'usuario',
          description: 'Usuario a besar',
          type: 'USER',
          required: true,
        }
      ],
    },
    {
      name: 'message',
      description: 'Message',
      type: 'SUB_COMMAND',
      options: [
        {
          name: 'message',
          description: 'Message to send',
          type: 'STRING',
          required: true,
        }
      ],
    },
    {
      name: 'pegarle',
      description: 'Pegarle a alguien',
      type: 'SUB_COMMAND',
      options: [
        {
          name: 'usuario',
          description: 'Usuario a pegar',
          type: 'USER',
          required: true,
        }
      ],
    },
    {
      name: 'chales',
      description: 'Chales',
      type: 'SUB_COMMAND',
    },
    {
      name: 'tliste',
      description: 'Tliste',
      type: 'SUB_COMMAND',
    },
    {
      name: 'kuwai',
      description: 'Kuwai',
      type: 'SUB_COMMAND',
    },
    {
      name: 'kurito',
      description: 'Kurito',
      type: 'SUB_COMMAND',
    },
    {
      name: 'alysita',
      description: 'Alisita',
      type: 'SUB_COMMAND',
    },
  ],
  run: async ({ interaction }) => {
    const response = new MessageEmbed().setColor("#15b500");

    switch (interaction.options.getSubcommand()) {
      case 'pegarle':
        response.setDescription(`${interaction.user} y Avastia le pegan a ${interaction.options.getUser('usuario', true)}`);
        break;
      case 'beso':
        response.setDescription(`${interaction.user} besa a ${interaction.options.getUser('usuario', true)}`);
        break;
      case 'message':
        response.setDescription(`${interaction.options.getString('message', true)}`);
        break;
      case 'kuwai':
      case 'tliste':
        response.setDescription(`Kuro es Pulga ${(interaction.options.getSubcommand() === "kuwai") ? "Kuwai" : "Tliste"}!`);
        break;
      case 'chales':
        response.setDescription(`Aly es Pulga Chales!`);
        break;
      case 'alysita':
      case 'kurito':
        response.setDescription(`${(interaction.options.getSubcommand() === "kurito") ? "Kurito es de Aly" : "Alysita es de Kuro"}!`);
        break;
      default:
        response.setDescription('');
        break;
    }
    interaction.followUp({ embeds: [response] });
  }
});