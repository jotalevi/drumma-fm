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

async function fetchTracks() {
    let urlList = [
        "https://soundcloud.com/eros_t/eros-at-ponzbday2025",
        "https://soundcloud.com/eros_t/back-forth-eros-remix",
        "https://soundcloud.com/eros_t/uoak-callumcantsleep-alouma-eros-remix",
        "https://soundcloud.com/drumma-records/felipe-venegas-felipe-nell-fare?si=6b2bcd37081d4a93aa4882573eb96aab&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing",
        "https://soundcloud.com/drumma-records/a1-variable-of-not-knowing-pou?si=1aaa2903dfd84f6888306dc38ed548ab&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing",
        "https://soundcloud.com/drumma-records/a2-black-mask-feat-imperatrice?si=9f137ca18c554986aa04739d7edf855a&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing",
        "https://soundcloud.com/drumma-records/b1-the-art-of-becoming-someone?si=c06ec62ec7ca4a51bf154efa8718ace5&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing",
        "https://soundcloud.com/drumma-records/b2-foam-for-losers?si=3c71f060a1854d69927328f19ca4df8c&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing",
        "https://soundcloud.com/drumma-records/a2-idana-telepatic?si=ba6b016a86b34189888144b90259245d&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing",
        "https://soundcloud.com/drumma-records/a1-idana-cantan-los-pajaros?si=4c93ec39d73545d0a388522a3a18dbb8&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing",
        "https://soundcloud.com/drumma-records/lucas-moss-bizza-hashish-1?si=5853ef155db34fcbb264b199a3bf7c22&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing",
        "https://soundcloud.com/drumma-records/lucas-moss-bizza-hashish-enzo?si=36d7357a5a894f9f87a7b726c9b60fa4&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing",
        "https://soundcloud.com/drumma-records/lucas-moss-bizza-hashish?si=0a4ddd1436d848a3b50b6963d9eba927&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing",
        "https://soundcloud.com/drumma-records/lucas-moss-bizza-circo-loco?si=164581b537d645a19cad923698490433&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing",
        "https://soundcloud.com/drumma-records/campoverde-homenaje?si=77cdc22a498d467091e5a43cede57b44&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing",
        "https://soundcloud.com/drumma-records/campoverde-salsa-modular?si=979733a0e99d48c19a1a13b049ad7069&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing",
        "https://soundcloud.com/drumma-records/campoverde-sonero?si=002cc41ee03d441b8ba42aea3853a699&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing",
        "https://soundcloud.com/drumma-records/ricardo-villalobos-umho-por?si=1957d5f1ee9946858e844f5e6b48a266&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing",
        "https://soundcloud.com/drumma-records/ricardo-villalobos-umho-por-2?si=4e0f54c76bfb4f5698d3bf4a5df4fd18&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing",
        "https://soundcloud.com/drumma-records/ricardo-villalobos-umho-por-1?si=e5476ecc90494ee5bb576f953e364c86&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing",
        "https://soundcloud.com/drumma-records/charlie-banks-scenic-route-org?si=d05ce1a4c0ed442385c21d0417186a72&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing",
        "https://soundcloud.com/drumma-records/charlie-banks-electrolyte?si=4ce2f3e23ea344128b30766901d6f015&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing",
        "https://soundcloud.com/drumma-records/charlie-banks-righter-than?si=3042bcbf945049d49c407d34d867136e&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing",
        "https://soundcloud.com/drumma-records/charlie-banks-scenic-route?si=6efa2c2e05d24ca5ae4cc5ba40cc7aca&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing",
        "https://soundcloud.com/drumma-records/bendejo-space-cake-remix-felipe-venegas-felipe-poll?si=cc7cc434f4554cf8a63035c14766bff9&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing",
        "https://soundcloud.com/drumma-records/io-mulen-forcefull?si=8f66ed07fe0c438fa0e23cddcf46f0a6&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing",
        "https://soundcloud.com/drumma-records/io-mulen-turboss?si=d0bd1e738b014feba49927f9633a4f53&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing",
        "https://soundcloud.com/drumma-records/toman-she-jazz?si=73530ce648b74b19b5a198c5abe01503&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing",
        "https://soundcloud.com/drumma-records/toman-no-string-attached?si=c302c3656a9a4b17903da221ec176f3e&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing",
        "https://soundcloud.com/drumma-records/toman-afterhours-with-you?si=36783161c17e4dd5b9861a9a0e468f21&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing",
        "https://soundcloud.com/drumma-records/toman-afterhours-with-you-1?si=69636c12772a4a64990cb79024c854fc&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing",
        "https://soundcloud.com/drumma-records/vasi?si=5fe0844820984013901c2cd8abf7c74f&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing",
        "https://soundcloud.com/drumma-records/the-mirrors-of-spirit?si=1775f18d29d54138b48f882b336ce300&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing",
        "https://soundcloud.com/drumma-records/luciano-barriere-de-lumiere?si=0a517533fdfe43a7bc7acf8b43e218f9&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing",
        "https://soundcloud.com/drumma-records/luciano-bipbopbap?si=40cb00cbf64947f7b8bf84c71bd8a6a5&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing",
        "https://soundcloud.com/drumma-records/luciano-barriere-de-lumiere-1?si=1d3f0c2841494e94b85175bbb76a396a&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing",
        "https://soundcloud.com/drumma-records/livio-roby-rachel-felipe-1?si=ba81e9dbb6b949a2b147ff3ae3922b47&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing",
        "https://soundcloud.com/drumma-records/livio-roby-pen-thru?si=38df995dd9684d3182c79882b504dc7a&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing",
        "https://soundcloud.com/drumma-records/livio-roby-rachel?si=3fa4a2e4c6fd4c3e967d77b733c4dd0b&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing",
        "https://soundcloud.com/drumma-records/felipe-venegas-umho-smoke-3?si=2619c567afed48d59f1d8d0d6178d732&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing",
        "https://soundcloud.com/drumma-records/felipe-venegas-umho-smoke-4?si=48afe6e15a3744b9810e65834f34b4b4&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing",
        "https://soundcloud.com/drumma-records/felipe-venegas-umho-smoke-5?si=3270ed4aedf34a8ab4dfd71e7c943a96&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing",
        "https://soundcloud.com/drumma-records/got-to-give-s-a-m-reshape?si=76e7ba4e73c04bbfa4c1ef41a31a71e5&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing",
        "https://soundcloud.com/drumma-records/got-to-take?si=8152088330664ee39ec9c7c1a9c9542f&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing",
        "https://soundcloud.com/drumma-records/got-to-give?si=8deeed8482814153a80a51b46a550ed0&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing",
        "https://soundcloud.com/drumma-records/b-ricardo-villalobos-melo-de-melo?si=691d9a21a05d44c6bd46b77437d95d86&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing",
        "https://soundcloud.com/drumma-records/a-ricardo-villalobos-umho-por-suerte?si=0ef8c12e0ea74819ac819f08c30d8cc2&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing",
        "https://soundcloud.com/drumma-records/bendejo-drain-remix-luc-ringeisen?si=4f8b32008bcf4538b744fa4091dd228d&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing",
        "https://soundcloud.com/drumma-records/bendejo-drain?si=e7a015fae82a41d7812f4e128de44047&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing",
        "https://soundcloud.com/drumma-records/bendejo-medea?si=5f0a7069d8864d409bef148330d1a2a3&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing",
        "https://soundcloud.com/drumma-records/bendejo-statics-movements?si=2e020a27529e40a188cc60789f7954a5&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing",
        "https://soundcloud.com/drumma-records/the-awakening?si=5979e810b13849038e04f94462119ddc&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing",
        "https://soundcloud.com/drumma-records/monoxide?si=dd7b0bdbdea542049e90f696d1a8231a&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing",
        "https://soundcloud.com/drumma-records/the-grind-valentino-kanzyani?si=81922aa3ebb64569aec6d3159412aeb4&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing",
        "https://soundcloud.com/drumma-records/the-grind?si=f4a233d2528a42afbdfd63cba792a9ef&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing"
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
    trackQueue
};

