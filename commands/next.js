const { SlashCommandBuilder } = require('discord.js');
const { skipToNextTrack, getCurrentTrack, getEmbed } = require('../player');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('next')
        .setDescription('Skips to the next track immediately'),

    async execute(interaction) {
        const track = getCurrentTrack();
        if (!track) {
            return interaction.reply({ content: '❌ No track is currently playing.', ephemeral: true });
        }

        await interaction.deferReply();

        try {
            await skipToNextTrack();
            const newTrack = getCurrentTrack();
            if (newTrack) {
                await interaction.editReply({
                    content: '⏭️ Skipped to next track!',
                    ...getEmbed()
                });
            } else {
                await interaction.editReply({ content: '⚠️ Skipped, but no more tracks are queued.' });
            }
        } catch (err) {
            console.error("❌ Error in /next:", err);
            await interaction.editReply({ content: '❌ Failed to skip to next track.' });
        }
    }
};
