# 🤖 Avastia (Discord Music Bot)

> Avastia is a Discord Music Bot built with TypeScript, discord.js & play-dl

<br>


## 📝 Key Features

> Note: Avastia uses slash commands for its interactions

- 🎶 Play music from YouTube or Spotify via url
  ![Loading...](https://i.imgur.com/cyeS1ph.gif)

- 📃 Play Youtube or Spotify playlists via url
  ![Loading...](https://i.imgur.com/IWlNHsX.gif)

- 🔎 Search music from YouTube
  ![Loading...](https://i.imgur.com/RD09Biu.gif)


<br>


## 🚀 Getting Started

```sh
git clone https://github.com/Axl47/Avastia.git
cd Avastia
npm install
```

After installation finishes follow configuration instructions.

<br>


## Requirements

1. Discord Bot Token | **[Guide](https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot)**
2. Node.js 16.9.0 or newer | **[Website](https://nodejs.org/en/)**

<br>

## ⚙️ Configuration

Create a new file named `.env` and create the next value:

⚠️ **Note: Never commit or share tokens or api keys publicly** ⚠️

```
DSTOKEN=bot token
```
<br>

After this, setting up authorization for Spotify is required.
1. Go to [Spotify Dashboard](https://developer.spotify.com/dashboard/login) and create an application
2. Opening it should reveal Client ID and Client Secret, save them somewhere for now.
3. Click on Edit Settings and go to Redirect URIs
4. Add this Redirect URI : `http://127.0.0.1/index.html`
5. Now run this command: `node authorize.js`
6. You will be asked:
     - Saving INFO in file or not | Select yes.
     - Client ID
     - Client Secret
     - Redirect URI or Redirect URL
     - Market | Choose 2 letter code on left side of your country name from [url](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2#Officially_assigned_code_elements) ]
     - You will be given a link for authorizing. Just paste it in your browser and click on authorize and copy the link that you are redirected to | Redirected Link should start with `http://127.0.0.1/index.html`
     - Paste the url in Redirected URL
  
A folder named `.data` should've been created. **Do not** delete this, and **do not** share it online.

<br>

**Starting the bot:**
- start:  `npm run start`
  - Runs using ts-node (not recommended for production)
- dev: `npm run start:dev`
  - Same as start but recompiles after detecting a change
- build: `npm run start:build`
  - Compiles to javascript in a dist folder
- watch: `npm run start:watch`
  - Same as build but recompiles after detecting a change
- prod: `npm run start:prod`
  - Starts the bot using the compiled code
  - Recommended for production

Suggested use: 
```
npm run build
npm run start:prod
```

<br>

## 📝 Commands

- Plays a song (`/play`)
  - Searches a query in YouTube
  - Supports YouTube or Spotify videos and playlists
- Search (`/search`)
  - Displays results from YouTube query
  - Able to choose what to play with buttons
  - Not functional in v14 (WIP)
- Now Playing (`/np`)
- Display Queue (`/queue`)
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
- Change the volume (`/volume`)
- Remove song from queue (`/remove`)
  - Removes via number or title
- Plays the current song from specified second (`/seek`)
- Rewind song (`/rewind`)
- Goes back a song (`/back`)
- Help (`/help`)
- Throws a Coin (`/coin`)

<br>

## 🚀 Technologies
1. TypeScript
2. Node.js
3. Discord.js v14
4. [play-dl](https://github.com/play-dl/play-dl)
5. ffmpeg & sodium

> Note: sodium requires multiple requirements for installation. Recommended to use libsodium-wrappers instead if there's any installation issues