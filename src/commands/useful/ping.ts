import { Command } from "../../structures/Command";

export default new Command({
    name: 'ping',
    description: 'replies pong',
    run: async ({ interaction }) => {
        interaction.followUp("Pong");
    }
});