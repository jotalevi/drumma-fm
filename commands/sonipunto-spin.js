const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('spin')
        .setDescription('Elige un usuario al azar de la lista de puntos')
        .addStringOption(option =>
            option.setName('cuantos')
                .setDescription('El numero de usuarios a elegir (default 1)')
                .setRequired(false)
        ),
        
    async execute(interaction) {
        let puntos = JSON.parse(fs.readFileSync('./puntos.json', 'utf8'));
        let agregate = []

        for (const [key, value] of Object.entries(puntos)) {
            agregate.push({
                id: key,
                ...value,
            });
        }

        agregate.sort((a, b) => {
            if (a.puntos > b.puntos) return -1;
            if (a.puntos < b.puntos) return 1;
            return 0;
        });

        let count = parseInt(interaction.options.getString('cuantos') || "1");
        let availableUsers = agregate.filter(user => user.puntos > 0); // Filter out users with 0 points
        const selected = [];

        while (selected.length < count) {
            // Calculate total puntos
            const totalPoints = availableUsers.reduce((sum, user) => sum + user.puntos, 0);

            // Get a random number between 0 and totalPoints
            let random = Math.random() * totalPoints;

            // Find user
            for (let i = 0; i < availableUsers.length; i++) {
                const user = availableUsers[i];
                random -= user.puntos;
                if (random <= 0) {
                    selected.push(user);
                    availableUsers.splice(i, 1); // Remove selected user to avoid repeats
                    break;
                }
            }
        }

        console.log(selected);
        
        await interaction.reply({
            embeds: [
                {
                    title: "",
                    fields: [
                        {
                            name: "Elegido",
                            value: selected.map(user => `ID: ${user.id}\nUsuario: ${user.at}\nPuntos: ${user.puntos}`).join("\n\n"),
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
