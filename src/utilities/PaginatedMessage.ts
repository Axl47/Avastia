import {
	ButtonStyle,
	type EmbedBuilder,
	type Message,
	type MessageComponentInteraction,
	type TextChannel,
} from 'discord.js';

const availableEmojis = ['⏮️', '◀️', '⏹️', '▶️', '⏭️'];

/**
 * Class for creating a Paginated Embed with buttons
 */
export class Pagination {
	message?: Message;
	channel: TextChannel;
	pages: EmbedBuilder[];
	timeout: number;
	index = 0;

	/**
	 * Constructor for a Paginated Embed with Buttons
	 * @constructor
	 * @param {TextChannel} channel - The target channel
	 * @param {EmbedBuilder[]} pages - Embed pages
	 * @param {number} timeout - How long button need to be active
	 */
	constructor(
		channel: TextChannel,
		pages: EmbedBuilder[],
		timeout: number = 60000,
	) {
		this.channel = channel;
		this.timeout = timeout;

		this.pages = pages.map((page, pageIndex) => {
			return page.setFooter({
				text: `Page ${pageIndex + 1} of ${pages.length}`,
			});
		});
	}

	/**
	 * Starts the pagination
	 */
	async paginate(): Promise<void> {
		this.message = await this.channel.send({
			embeds: [this.pages[this.index]],
			components: (this.pages.length < 2) ? [] :
				[
					{
						type: 1,
						components: [
							{
								type: 2,
								style: ButtonStyle.Primary,
								label: 'First',
								emoji: '⏮️',
								customId: '⏮️',
							},
							{
								type: 2,
								style: ButtonStyle.Primary,
								label: 'Prev',
								emoji: '◀️',
								customId: '◀️',
							},
							{
								type: 2,
								style: ButtonStyle.Danger,
								label: 'Stop',
								emoji: '⏹️',
								customId: '⏹️',
							},
							{
								type: 2,
								style: ButtonStyle.Primary,
								label: 'Next',
								emoji: '▶️',
								customId: '▶️',
							},
							{
								type: 2,
								style: ButtonStyle.Primary,
								label: 'Last',
								emoji: '⏭️',
								customId: '⏭️',
							},
						],
					},
				],
		});
		if (this.pages.length < 2) {
			return;
		}
		const interactionCollector = this.message?.createMessageComponentCollector({
			max: this.pages.length * 5,
		});
		setTimeout(
			async () => {
				interactionCollector?.stop('Timeout');
				await this?.message?.edit({
					components: [],
				});
			},
			this.timeout,
		);
		interactionCollector.on('collect',
			async (interaction: MessageComponentInteraction) => {
				const { customId } = interaction;
				let newIndex =
					// Start
					customId === availableEmojis[0] ?
						0 :
						// Prev
						customId === availableEmojis[1] ?
							this.index - 1 :
							// Stop
							customId === availableEmojis[2] ?
								NaN :
								// Next
								customId === availableEmojis[3] ?
									this.index + 1 :
									// End
									customId === availableEmojis[4] ?
										this.pages.length - 1 :
										this.index;
				if (isNaN(newIndex)) {
					// Stop
					interactionCollector.stop('stopped by user');
					await interaction.update({
						components: [],
					});
				}
				else {
					if (newIndex < 0) newIndex = 0;
					if (newIndex >= this.pages.length) newIndex = this.pages.length - 1;
					this.index = newIndex;
					await interaction.update({
						embeds: [this.pages[this.index]],
					});
				}
			});
		interactionCollector.on('end', async () => {
			await this?.message?.edit({
				components: [],
			});
		});
	}
}
