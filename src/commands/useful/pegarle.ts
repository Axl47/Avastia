import {
	ApplicationCommandType,
	ApplicationCommandOptionType,
	EmbedBuilder,
} from 'discord.js';

import { Command } from '../../structures/Command';

/**
 * Multiple random commands used with friends
 */
export default new Command({
	name: 'random',
	description: 'Diferent random messages',
	type: ApplicationCommandType.ChatInput,
	options: [
		{
			name: 'beso',
			description: 'Besar a alguien',
			type: ApplicationCommandOptionType.Subcommand,
			options: [
				{
					name: 'usuario',
					description: 'Usuario a besar',
					type: ApplicationCommandOptionType.User,
					required: true,
				},
			],
		},
		{
			name: 'message',
			description: 'Message',
			type: ApplicationCommandOptionType.Subcommand,
			options: [
				{
					name: 'message',
					description: 'Message to send',
					type: ApplicationCommandOptionType.String,
					required: true,
				},
			],
		},
		{
			name: 'pegarle',
			description: 'Pegarle a alguien',
			type: ApplicationCommandOptionType.Subcommand,
			options: [
				{
					name: 'usuario',
					description: 'Usuario a pegar',
					type: ApplicationCommandOptionType.User,
					required: true,
				},
			],
		},
		{
			name: 'chales',
			description: 'Chales',
			type: ApplicationCommandOptionType.Subcommand,
		},
		{
			name: 'tliste',
			description: 'Tliste',
			type: ApplicationCommandOptionType.Subcommand,
		},
		{
			name: 'kuwai',
			description: 'Kuwai',
			type: ApplicationCommandOptionType.Subcommand,
		},
		{
			name: 'kurito',
			description: 'Kurito',
			type: ApplicationCommandOptionType.Subcommand,
		},
		{
			name: 'alysita',
			description: 'Alisita',
			type: ApplicationCommandOptionType.Subcommand,
		},
	],
	run: async ({ interaction, args }): Promise<void> => {
		let description: string;

		switch (args.getSubcommand()) {
			case 'pegarle':
				description =
					`${interaction.user} y Avastia le pegan a ${args.getUser('usuario')}`;
				break;
			case 'beso':
				description = `${interaction.user} besa a ${args.getUser('usuario')}`;
				break;
			case 'message':
				description = `${args.getString('message', true)}`;
				break;
			case 'kuwai':
			case 'tliste':
				description = `Kuro es Pulga ${(args.getSubcommand() === 'kuwai') ?
					'Kuwai' : 'Tliste'}!`;
				break;
			case 'chales':
				description = 'Aly es Pulga Chales!';
				break;
			case 'alysita':
			case 'kurito':
				description = `${(args.getSubcommand() === 'kurito') ?
					'Kurito es de Aly' : 'Alysita es de Kuro'}!`;
				break;
			default:
				description = '';
				break;
		}
		const response = new EmbedBuilder()
			.setColor('#15b500')
			.setDescription(description);
		interaction.followUp({ embeds: [response] });
	},
});
