const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');
const Bots = require("@models/bots");

const { server: {id} } = require("@root/config.json");

module.exports = class extends Command {
    constructor(...args) {
        super(...args, {
            aliases: ["cola", "pendiente"],
            permissionLevel: 8,
            description: "Mira la lista de bots pendientes.",
        });
    }

    async run(message) {
        let cont = "";
        let bots = await Bots.find({ state: "unverified" }, { _id: false })

        bots.forEach(bot => { cont += `<@${bot.botid}> : [Invitacion](https://discord.com/oauth2/authorize?client_id=${bot.botid}&scope=bot&guild_id=${id}&permissions=0)\n` })
        if (bots.length === 0) cont = "No hay bots pendientes";

        let embed = new MessageEmbed()
            .setTitle('Pendientes')
            .setColor(0x6b83aa)
            .setDescription(cont)
        message.channel.send(embed)
    }
};