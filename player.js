const play = require("play-dl");
const axios = require("axios");
const cheerio = require("cheerio");

const {
    joinVoiceChannel,
    createAudioPlayer,
    createAudioResource,
    AudioPlayerStatus,
} = require("@discordjs/voice");

let trackQueue = [];
let currentTrack = null;
const player = createAudioPlayer();
const guildConnections = new Map(); // guildId -> array of voice connections
let textChannel = null;

async function fetchTracks() {
    let urlList = [
        "https://soundcloud.com/eros_t/eros-at-ponzbday2025",
        "https://soundcloud.com/eros_t/back-forth-eros-remix",
        "https://soundcloud.com/eros_t/uoak-callumcantsleep-alouma-eros-remix",
        "https://soundcloud.com/eros_t/rec002",
        "https://soundcloud.com/drumma-records/felipe-venegas-felipe-nell-fare"
    ];
    return await fetchTracksFromUrls(urlList);
}

async function fetchTracksFromUrls(urlList) {
    await play.setToken({ soundcloud: { client_id: await play.getFreeClientID() } });

    const playable = [];

    for (const url of urlList) {
        try {
            const track = await play.soundcloud(url);
            playable.push(track);
        } catch (err) {
            console.warn(`⚠️ Failed to load track: ${url}`);
        }
    }

    trackQueue = playable.sort(() => 0.5 - Math.random());

    console.log(`🎧 Loaded ${trackQueue.length} valid tracks from provided URLs.`);
}


async function addTrackToQueue(url) {
    await play.setToken({ soundcloud: { client_id: await play.getFreeClientID() } });

    if (!url.includes("soundcloud.com")) return false;

    try {
        const track = await play.video_basic_info(url);
        trackQueue.push(track);
        return true;
    } catch (err) {
        console.warn(`❌ Failed to add track: ${url}`);
        return false;
    }
}

function buildEmbed(track) {
    const duration = track.durationInSec
        ? new Date(track.durationInSec * 1000).toISOString().substr(14, 5)
        : "Unknown";

    return {
        embeds: [
            {
                title: track.name,
                description: `[Open on SoundCloud](${track.permalink})`,
                thumbnail: { url: track.thumbnail },
                fields: [
                    { name: "Length", value: duration, inline: true },
                    { name: "Uploader", value: track.user?.name || "Unknown", inline: true },
                ],
                footer: { text: "Streaming via SoundCloud" },
                color: 0xff5500,
            },
        ],
    };
}

async function playNextTrack(consecutiveFailures = 0) {
    
    if (consecutiveFailures >= 3) {
        console.error("❌ Too many consecutive errors. Stopping playback.");
        if (textChannel) textChannel.send("❌ Too many consecutive errors. Stopping playback.");
        return;
    }

    if (trackQueue.length === 0) await fetchTracks();
    currentTrack = trackQueue.pop();

    console.log(currentTrack)

    console.log("🔊 Now playing:", currentTrack.name, currentTrack.url?.replace("api.", ""));

    try {
        const stream = await play.stream(currentTrack.url, {
            discordPlayerCompatibility: true,
        });

        const resource = createAudioResource(stream.stream, {
            inputType: stream.type,
        });

        player.play(resource);

        if (textChannel) textChannel.send(buildEmbed(currentTrack));
    } catch (err) {
        console.error("❌ Failed to play stream:", err.message);
        if (textChannel) textChannel.send("❌ Failed to play this track. Skipping...");
        playNextTrack(consecutiveFailures + 1);
    }
}

async function joinAndPlay(voiceChannel, targetTextChannel) {
    const guildId = voiceChannel.guild.id;

    const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId,
        adapterCreator: voiceChannel.guild.voiceAdapterCreator,
    });

    connection.subscribe(player);

    if (!guildConnections.has(guildId)) {
        guildConnections.set(guildId, []);
    }

    // Prevent duplicate entries
    const connections = guildConnections.get(guildId);
    const alreadyConnected = connections.find((c) => c.joinConfig.channelId === voiceChannel.id);
    if (!alreadyConnected) {
        connections.push(connection);
    }

    textChannel = targetTextChannel;

    // Only fetch and start playing if nothing is already playing
    if (!currentTrack) {
        await fetchTracks();
        await playNextTrack();
    }
}

async function skipToNextTrack() {
    await playNextTrack();
}

player.on(AudioPlayerStatus.Idle, () => {
    playNextTrack();
});

module.exports = {
    joinAndPlay,
    getCurrentTrack: () => currentTrack,
    getEmbed: () => currentTrack ? buildEmbed(currentTrack) : null,
    skipToNextTrack,
    addTrackToQueue, // ✅ new
};

