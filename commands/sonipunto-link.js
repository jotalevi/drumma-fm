const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('link')
        .setDescription('Linkea un usuario a un aka y lo agrega a la base de datos')
        .addStringOption(option =>
            option.setName('user')
                .setDescription('El usuario que quieres linkear (@usuario)')
                .setRequired(true)
        ).addStringOption(option =>
            option.setName('aka')
                .setDescription('El aka que quieres linkear (#aka)')
                .setRequired(true)
        ),
        
    async execute(interaction) {
        let puntos = JSON.parse(fs.readFileSync('./puntos.json', 'utf8'));    

        let user = interaction.options.getString('user');
        let aka = interaction.options.getString('aka');
        let id = Math.floor(Math.random() * 1000000);

        puntos[id] = {
            aka: aka,
            at: user,
            puntos: 0,
        }

        fs.writeFileSync('./puntos.json', JSON.stringify(puntos, null, 2), 'utf8');

        await interaction.reply({
            embeds: [
                {
                    title: `Linkeado ${user} a ${aka}`,
                    fields: [
                        {
                            name: "ID",
                            value: id.toString(),
                            inline: true,
                        },
                        {
                            name: "Puntos",
                            value: 0,
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
