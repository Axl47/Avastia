# 🤖 Avastia (Discord Music Bot)

> Avastia is a Discord Music Bot built with TypeScript, discord.js & play-dl

## 📝 Key Features

> Note: Avastia uses slash commands for its interactions

`Add a gif to every item in the list`
- 🎶 Play music from YouTube or Spotify via url
- 📃 Play Youtube or Spotify playlists via url
- 🔎 Search music from YouTube or Spotify
- 🔎 Search and select music to play

## 🚀 Getting Started

```sh
git clone https://github.com/Axl47/Avastia.git
cd Avastia
npm install
```

After installation finishes follow configuration instructions.

**Starting the bot:**
- start:  `npm run start`
  - Compiles using tsc and runs at runtime (explain this better after research)
- dev: `npm run start:dev`
  - Same as start but recompiles after detecting a change
  - Not recommended for long periods of time (explain why its slower and whatever tsc)
- build: `npm run start:build`
  - Compiles the code to javascript in a dist folder
- watch: `npm run start:watch`
  - Same as build but recompiles after detecting a change
- prod: `npm run start:prod`
  - Starts the bot using the compiled code
  - Recommended for production

## Requirements

1. Discord Bot Token | **[Guide](https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot)**
2. Genius API Key | **[Guide](guide-link)**
3. Spotify Data Setup | **[Guide](guide-link)**
   1. TODO: Clear this up, explain process, try to eliminate the need for this
4. Node.js 16.11.0 or newer | **[Website](node-website)**
   1. TODO: Investigate if node 16 is enough for installation | discord.js requirement

## ⚙️ Configuration

Create a new file named `.env` and create the next values

⚠️ **Note: Never commit or share tokens or api keys publicly** ⚠️

```
DSTOKEN=bot token
geniusKey=genius key
```

## 📝 Commands

- Plays a song (`/play`)
  - Searches a query in YouTube
  - Supports YouTube or Spotify videos and playlists
- Search (`/search`)
  - Displays results from YouTube query
  - Able to choose what to play with buttons
- Now Playing (`/np`)
- Queue system (`/queue`)
- Loop (`/loop`)
  - Loop only one song (`/loop song`)
  - Loop entire queue (`/loop queue`)
  - Disable looping (`/loop disable`)
- Shuffle (`/shuffle`)
- Lyrics (`/lyrics`)
- Pause (`/pause`)
  - Toogles between pause and resume
- Skip (`/skip`)
- Jump x amount of songs (`/jump`)
- Remove song from queue (`/remove`)
  - Removes via index or title
- Help (`/help`)

## 🚀 Technologies
1. TypeScript
2. discord.js V14
3. [play-dl](playdl-github-link)
4. ffmpeg & sodium

> Note: sodium requires multiple requirements for installation. Recommended to use libsodium-wrappers instead if there's any installation issues