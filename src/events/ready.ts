import { Event } from '../structures/Event.js';

/**
 * Event called after the client
 * is connected to Discord's API
 */
export default new Event('ready', async (client): Promise<void> => {
	console.log(`${client?.user?.username} is online!`);
	client.user?.setStatus('online');
});
