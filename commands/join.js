const { SlashCommandBuilder } = require('discord.js');
const { joinAndPlay } = require('../player');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('join')
        .setDescription('Tells the bot to join your voice channel and start playing music'),
    async execute(interaction) {
        const voiceChannel = interaction.member.voice.channel;
        if (!voiceChannel) {
            return interaction.reply({ content: 'You must be in a voice channel!' });
        }
        await interaction.reply({ content: `Joining ${voiceChannel.name} and playing!` });
        await joinAndPlay(voiceChannel, interaction.channel);
    },
};
