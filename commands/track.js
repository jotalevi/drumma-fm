const { SlashCommandBuilder } = require('discord.js');
const { getEmbed } = require('../player');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('track')
        .setDescription('Shows the current playing track'),
    async execute(interaction) {
        const embed = getEmbed();
        if (!embed) {
            return interaction.reply({ content: "No track is playing right now." });
        }
        await interaction.reply(embed);
    },
};
