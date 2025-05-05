const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rank')
        .setDescription('Lista los puntos de los usuarios')
        .addStringOption(option =>
            option.setName('max')
                .setDescription('El maximo de usuarios que quieres listar (default 10)')
                .setRequired(false)
        ),
        
    async execute(interaction) {
        let puntos = JSON.parse(fs.readFileSync('./puntos.json', 'utf8'));

        let agregate = []

        for (const [key, value] of Object.entries(puntos)) {
            agregate.push({
                id: key,
                ...value
            });
        }

        agregate.sort((a, b) => {
            if (a.puntos > b.puntos) return -1;
            if (a.puntos < b.puntos) return 1;
            return 0;
        });

        let max = parseInt(interaction.options.getString('max') || "10");
        if (max > agregate.length) max = agregate.length;
        
        let display = agregate.slice(0, max).map((value, index) => {
            return {
                name: `${index + 1} - ${value.aka}`,
                value: `ID: ${value.id}\nUsuario: ${value.at}\nPuntos: ${value.puntos}`,
                inline: true,
            };
        });
        
        await interaction.reply({
            embeds: [
                {
                    title: "LOG",
                    fields: display,
                    color: 0xf455ff,
                },
            ],
        },
        );

    }
};
