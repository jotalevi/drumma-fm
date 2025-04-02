const { SlashCommandBuilder } = require('discord.js');
const { askForTrack } = require('../player.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pedirtema')
        .setDescription('agrega un tema a la cola de reproduccion')
        .addStringOption(option =>
            option.setName('tema')
                .setDescription('El tema que quieres pedir (enlace de soundcloud)')
                .setRequired(true)
        ),

    async execute(interaction) {
        await interaction.deferReply();

        const tema = interaction.options.getString('tema');
        let track = await askForTrack(tema)

        if (!track) {
            interaction.editReply({ content: '❌ No encontramos el tema que pediste.', ephemeral: true });
        } else {
            const duration = track.durationInSec
                ? new Date(track.durationInSec * 1000).toISOString().substr(14, 5)
                : "Unknown";
            interaction.editReply({
                ephemeral: true,
                embeds: [
                    {
                        title: `Has pedido ${track.name}`,
                        url: track.permalink,
                        description: `[Open on SoundCloud](${track.permalink})`,
                        thumbnail: { url: track.thumbnail },
                        fields: [
                            { name: "Length", value: duration, inline: true },
                            { name: "Uploader", value: track.user?.name || "Unknown", inline: true },
                        ],
                        footer: { text: "Este tema esta en la cola de requests. Hay un 75% de chance de que la radio elija un tema de la cola de requests sobre la cola predefinida." },
                        color: 0xff5500,
                    },
                ],
            })
        }
    }
};
