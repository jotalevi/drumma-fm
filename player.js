const play = require("play-dl");
const axios = require("axios");
const cheerio = require("cheerio");

const {
    joinVoiceChannel,
    createAudioPlayer,
    createAudioResource,
    AudioPlayerStatus,
} = require("@discordjs/voice");

const trackQueue = [];
let currentTrack = null;
const player = createAudioPlayer();
const guildConnections = new Map();
let textChannel = null;

const askedForTracks = []

async function askForTrack(url) {
    await play.setToken({ soundcloud: { client_id: await play.getFreeClientID() } });
    let playable = null;

    try {
        const track = await play.soundcloud(url);
        playable = track;
    } catch (err) {
        console.warn(`⚠️ Failed to load track: ${url}`);
    }

    if (!playable) return false;

    askedForTracks.push(playable);
    return playable;
}

async function fetchTracks() {
    let urlList = [
        "https://soundcloud.com/eros_t/eros-at-ponzbday2025",
        "https://soundcloud.com/eros_t/back-forth-eros-remix",
        "https://soundcloud.com/eros_t/uoak-callumcantsleep-alouma-eros-remix",
        "https://soundcloud.com/drumma-records/felipe-venegas-felipe-nell-fare",
        "https://soundcloud.com/drumma-records/a1-variable-of-not-knowing-pou",
        "https://soundcloud.com/drumma-records/a2-black-mask-feat-imperatrice",
        "https://soundcloud.com/drumma-records/b1-the-art-of-becoming-someone",
        "https://soundcloud.com/drumma-records/b2-foam-for-losers",
        "https://soundcloud.com/drumma-records/a2-idana-telepatic",
        "https://soundcloud.com/drumma-records/a1-idana-cantan-los-pajaros",
        "https://soundcloud.com/drumma-records/lucas-moss-bizza-hashish-1",
        "https://soundcloud.com/drumma-records/lucas-moss-bizza-hashish-enzo",
        "https://soundcloud.com/drumma-records/lucas-moss-bizza-hashish",
        "https://soundcloud.com/drumma-records/lucas-moss-bizza-circo-loco",
        "https://soundcloud.com/drumma-records/campoverde-homenaje",
        "https://soundcloud.com/drumma-records/campoverde-salsa-modular",
        "https://soundcloud.com/drumma-records/campoverde-sonero",
        "https://soundcloud.com/drumma-records/ricardo-villalobos-umho-por",
        "https://soundcloud.com/drumma-records/ricardo-villalobos-umho-por-2",
        "https://soundcloud.com/drumma-records/ricardo-villalobos-umho-por-1",
        "https://soundcloud.com/drumma-records/charlie-banks-scenic-route-org",
        "https://soundcloud.com/drumma-records/charlie-banks-electrolyte",
        "https://soundcloud.com/drumma-records/charlie-banks-righter-than",
        "https://soundcloud.com/drumma-records/charlie-banks-scenic-route",
        "https://soundcloud.com/drumma-records/bendejo-space-cake-remix-felipe-venegas-felipe-poll",
        "https://soundcloud.com/drumma-records/io-mulen-forcefull",
        "https://soundcloud.com/drumma-records/io-mulen-turboss",
        "https://soundcloud.com/drumma-records/toman-she-jazz",
        "https://soundcloud.com/drumma-records/toman-no-string-attached",
        "https://soundcloud.com/drumma-records/toman-afterhours-with-you",
        "https://soundcloud.com/drumma-records/toman-afterhours-with-you-1",
        "https://soundcloud.com/drumma-records/vasi",
        "https://soundcloud.com/drumma-records/the-mirrors-of-spirit",
        "https://soundcloud.com/drumma-records/luciano-barriere-de-lumiere",
        "https://soundcloud.com/drumma-records/luciano-bipbopbap",
        "https://soundcloud.com/drumma-records/luciano-barriere-de-lumiere-1",
        "https://soundcloud.com/drumma-records/livio-roby-rachel-felipe-1",
        "https://soundcloud.com/drumma-records/livio-roby-pen-thru",
        "https://soundcloud.com/drumma-records/livio-roby-rachel",
        "https://soundcloud.com/drumma-records/felipe-venegas-umho-smoke-3",
        "https://soundcloud.com/drumma-records/felipe-venegas-umho-smoke-4",
        "https://soundcloud.com/drumma-records/felipe-venegas-umho-smoke-5",
        "https://soundcloud.com/drumma-records/got-to-give-s-a-m-reshape",
        "https://soundcloud.com/drumma-records/got-to-take",
        "https://soundcloud.com/drumma-records/got-to-give",
        "https://soundcloud.com/drumma-records/b-ricardo-villalobos-melo-de-melo",
        "https://soundcloud.com/drumma-records/a-ricardo-villalobos-umho-por-suerte",
        "https://soundcloud.com/drumma-records/bendejo-drain-remix-luc-ringeisen",
        "https://soundcloud.com/drumma-records/bendejo-drain",
        "https://soundcloud.com/drumma-records/bendejo-medea",
        "https://soundcloud.com/drumma-records/bendejo-statics-movements",
        "https://soundcloud.com/drumma-records/the-awakening",
        "https://soundcloud.com/drumma-records/monoxide",
        "https://soundcloud.com/drumma-records/the-grind-valentino-kanzyani",
        "https://soundcloud.com/drumma-records/the-grindg"
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

    playable.sort(() => 0.5 - Math.random()).forEach((track) => {
        trackQueue.push(track);
    });

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

    if (Math.random() < 0.75 && askedForTracks.length > 0)
        currentTrack = askedForTracks.pop();
    else
        currentTrack = trackQueue.pop();

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

    // Create a new voice connection if this guild doesn't have one
    const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId,
        adapterCreator: voiceChannel.guild.voiceAdapterCreator,
    });

    connection.subscribe(player); // All connections share the same player

    // Manage multiple connections per guild
    if (!guildConnections.has(guildId)) {
        guildConnections.set(guildId, []);
    }

    const connections = guildConnections.get(guildId);
    if (!connections.find((c) => c.channelId === voiceChannel.id)) {
        connections.push(connection);
    }

    // If it's the first connection, start playing
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
    addTrackToQueue,
    trackQueue,
    askForTrack
};

