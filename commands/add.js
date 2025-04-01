const { SlashCommandBuilder } = require("discord.js");
const { addTrackToQueue, getEmbed } = require("../player");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("add")
        .setDescription("Add a SoundCloud track to the playlist")
        .addStringOption(option =>
            option.setName("url")
                .setDescription("SoundCloud track URL")
                .setRequired(true)
        ),

    async execute(interaction) {
        const url = interaction.options.getString("url");

        await interaction.deferReply();

        try {
            const added = await addTrackToQueue(url);
            if (!added) throw new Error("Invalid or unsupported track.");

            await interaction.editReply({
                content: `✅ Added track to the queue!`,
                ...getEmbed()
            });
        } catch (err) {
            console.error(err);
            await interaction.editReply({
                content: `❌ Could not add track: ${err.message || err}`,
            });
        }
    },
};
