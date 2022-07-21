import { Command } from "../../structures/Command";
import { MessageEmbed } from "discord.js";

export default new Command({
  name: 'help',
  description: 'Sends a message with all commands',
  run: async ({ interaction }) => {
    const response = new MessageEmbed()
      .setColor("#15b500")
      .setTitle("Commands:")
      .setDescription("All available commands...")
      .addFields(
        { name: "/play", value: "Searches on Youtube/Spotify and plays the result.", inline: true, },
        { name: "/skip", value: "Skips to the next song.", inline: true },
        { name: "\u200B", value: "\u200B" },

        { name: "/pause", value: "Pauses the player.", inline: true },
        { name: "/resume", value: "Unpauses the player.", inline: true, },
        { name: "\u200B", value: "\u200B" },

        { name: "/stop", value: "Disconnects the player and clears the queue.", inline: true, },
        { name: "/loop", value: "Toogles looping the queue.", inline: true },
        { name: "\u200B", value: "\u200B" },

        { name: "/now", value: "Sends the song currently playing.", inline: true, },
        { name: "/shuffle", value: "Shuffles the queue.", inline: true },
        { name: "\u200B", value: "\u200B" },

        { name: "/queue", value: "Sends the queue to the channel.", inline: true, },
        { name: "/lyrics", value: "Sends the lyrics of the current or desired song", inline: true, },
        { name: "\u200B", value: "\u200B" },

        { name: "/jump", value: "Jumps x songs.", inline: true },
        { name: "/remove", value: "Removes the song with x title, or the x song in the queue.", inline: true, },
        { name: "\u200B", value: "\u200B" },

        { name: "/rewind", value: "Rewinds the current song.", inline: true },
        { name: "/coin", value: "Throws a coin.", inline: true },
      );

    return interaction.followUp({ embeds: [response] });
  }
});