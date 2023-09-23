// import {
// 	ApplicationCommandType,
// 	Client,
// 	EmbedBuilder,
// } from 'discord.js';
// import express from 'express';
// import SpotifyWebApi from 'spotify-web-api-node';

// import { videoPlayer } from '../../commands/music/play.js';
// import { queue } from '../../structures/Client.js';
// import { randomColor } from '../../structures/Colors.js';
// import { Command } from '../../structures/Command.js';

// /**
//  * Mounts the bot to spotify
//  */
// export default new Command({
// 	name: 'spotify',
// 	description: 'Makes bot track Axel\'s Spotify :D.',
// 	type: ApplicationCommandType.ChatInput,
// 	run: async ({ interaction }): Promise<void> => {
// 		const songQueue = queue.get(interaction.commandGuildId!);
// 		if (!songQueue?.player) {
// 			await interaction.editReply('Not playing anything.');
// 			return;
// 		}


// 		const app = express();
// 		const spotifyApi = new SpotifyWebApi();

// 		app.get('/spotify/callback', async (req: any, res: any) => {
// 			const code = req.query.code;
// 			// const state = req.query.state;

// 			if (req.query.error) {
// 				console.error('Callback Error:', req.query.error);
// 				res.send(`Callback Error: ${req.query.error}`);
// 				return;
// 			}

// 			try {
// 				const data = await spotifyApi.authorizationCodeGrant(code as string);
// 				const accessToken = data.body['access_token'];
// 				const refreshToken = data.body['refresh_token'];
// 				const expiresIn = data.body['expires_in'];

// 				spotifyApi.setAccessToken(accessToken);
// 				spotifyApi.setRefreshToken(refreshToken);

// 				console.log('access_token:', accessToken);
// 				console.log('refresh_token:', refreshToken);
// 				console.log(`Sucessfully retrieved access token. Expires in ${expiresIn} s.`);

// 				res.send('Success! You can now close the window.');
// 			}
// 			catch (e) {
// 				console.error('Error getting Tokens:', e);
// 				res.send(`Error getting Tokens: ${e}`);
// 			}
// 		});

// 		app.listen(8888, () => {
// 			console.log('HTTP server running on http://localhost:8888');
// 		});


// 		videoPlayer(interaction.commandGuildId!, songQueue.songs[songQueue.loopIndex]);

// 		const response = new EmbedBuilder()
// 			.setColor(randomColor())
// 			.setDescription('Went back!');
// 		await interaction.editReply({ embeds: [response] });
// 	},
// });
