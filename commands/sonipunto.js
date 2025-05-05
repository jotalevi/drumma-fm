const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sonipunto')
        .setDescription('Agrega (o subtrae) puntos a un usuario')
        .addStringOption(option =>
            option.setName('user')
                .setDescription('El usuario que quieres pedir @usuario o #aka')
                .setRequired(true)
        ).addStringOption(option =>
            option.setName('puntos')
                .setDescription('La cantidad de puntos que quieres agregar o substraer (-999999 a 999999)')
                .setRequired(true)
        ),
        
    async execute(interaction) {
        let puntos = JSON.parse(fs.readFileSync('./puntos.json', 'utf8'));    
        let points = parseInt(interaction.options.getString('puntos'));
        let user = interaction.options.getString('user');
        let id = -1;

        for (const [key, value] of Object.entries(puntos)) {
            if (value.at === user || value.aka === user) {
                id = key;
                break;
            }
        }

        if (id === -1) {
            await interaction.reply({
                content: `No se ha encontrado el usuario ${user}`,
                ephemeral: true,
            });
            return;
        }

        puntos[id].puntos += points;

        let _displayAka = puntos[id].aka;
        let _displayUser = puntos[id].at;

        fs.writeFileSync('./puntos.json', JSON.stringify(puntos, null, 2), 'utf8');

        await interaction.reply({
            embeds: [
                {
                    title: `${_displayAka} ha ${points >= 0 ? "recibido" : "perdido"} ${points} puntos`,
                    fields: [
                        {
                            name: "Usuario",
                            value: _displayUser,
                            inline: true,
                        },
                        {
                            name: "Aka",
                            value: _displayAka,
                            inline: true,
                        },
                        {
                            name: "Puntos",
                            value: parseInt(puntos[id].puntos),
                            inline: true,
                        },
                    ],
                    color: 0xf455ff,
                },
            ],
        },
        );

    }
};
