# 📻 drumma-fm — 24/7 SoundCloud Streaming Bot for Discord

**drumma-fm** is a Discord bot that streams a randomized loop of tracks from [Drumma Records](https://soundcloud.com/drumma-records), 24/7, in multiple voice channels simultaneously. It also allows users to contribute their favorite SoundCloud tracks in real time using slash commands.

---

## 🎧 Features

- 🔁 Plays a continuous loop of curated SoundCloud tracks from Drumma Records
- ➕ Add new tracks to the playlist using `/add`
- 🔀 Randomized track queue
- ⏭️ Skip current track with `/next`
- 🎵 View current track with `/track`
- 🔊 Multi-VC playback: bot streams the same track in multiple voice channels
- 📍 Restricted to a specific text channel for commands

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- FFmpeg installed and in your system path
- Discord bot token and application set up at [discord.com/developers](https://discord.com/developers)

---

### Installation

1. Clone the repo

```bash
git clone https://github.com/yourusername/drumma-fm.git
cd drumma-fm
```

2. Install dependencies

```bash
npm install
```

3. Create a `.env` file:

```env
DISCORD_TOKEN=your-discord-bot-token
CLIENT_ID=your-discord-app-id
GUILD_ID=your-server-id
```

4. Run the bot

```bash
node index.js
```

---

## 🛠 Slash Commands

| Command     | Description                                      |
|-------------|--------------------------------------------------|
| `/join`     | Bot joins your current voice channel             |
| `/track`    | Displays the currently playing track             |
| `/next`     | Skips to the next track in the randomized queue  |
| `/add [url]`| Adds a SoundCloud track to the playback loop     |

> ⚠️ Commands are restricted to a specific text channel (`1356647093686636757` by default).

---

## 📡 Architecture

- Uses [`@discordjs/voice`](https://discord.js.org/#/docs/voice/main/general/welcome) for audio streaming
- [`play-dl`](https://www.npmjs.com/package/play-dl) for SoundCloud playback
- Multi-guild and multi-VC aware (same track in all channels)
- Simple randomized queue with dynamic user input

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss your ideas.

---

## 📄 License

MIT

---

## ❤️ Inspired by

- [Drumma Records](https://soundcloud.com/drumma-records)
- Community-built music bots like RedBot, FredBoat, and Juke