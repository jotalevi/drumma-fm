const { SlashCommandBuilder } = require("discord.js");
const { trackQueue } = require("../player");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("queue")
    .setDescription("List all tracks in queue"),

  async execute(interaction) {
    let totalQueue = trackQueue.length;
    let nextFew = trackQueue.slice(trackQueue.length - 10).reverse();
    let totalQueueDuration = trackQueue.reduce(
      (acc, track) => acc + track.durationInSec,
      0
    );
    let totalQueueDurationFormatted = new Date(totalQueueDuration * 1000)
      .toISOString()
      .substr(11, 8);

    await interaction.reply({
        embeds: [
          {
            title: "Current Queue",
            description: `There are ${totalQueue} tracks in the queue`,
            fields: [
              ...nextFew.map((track, index) => {
                return {
                  name: `${index + 1} - ${track.name} ${new Date(track.durationInSec * 1000)
                    .toISOString()
                    .substr(11, 8)}`,
                  value: "",
                };
              }),
              {
                name: "...",
                value: "",
              },
            ],
            footer: {
              text: `Total Duration: ${totalQueueDurationFormatted}`,
            },
            color: 0xff5500,
          },
        ],
      },
    );
  },
};
