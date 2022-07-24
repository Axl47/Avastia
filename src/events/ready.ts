import { Event } from "../structures/Event";
import { client } from "../main"

export default new Event('ready', () => {
  console.log(`${client?.user?.username} is online!`);
  client.user?.setStatus('online');
  client.user?.setActivity("/help", { type: "PLAYING" })
});