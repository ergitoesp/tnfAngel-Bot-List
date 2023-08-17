const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');
const Bots = require("@models/bots");


module.exports = class extends Command {
    constructor(...args) {
        super(...args, {
            aliases: ["bot-info", "info"],
            usage: '[User:user]',
            description: "Muestra la informacion de un bot de la lista.",
        });
    }

    async run(message, [user]) {
        if (!user || !user.bot) return message.channel.send(`Menciona un bot para obtener la info.`);
        if (user.id === message.client.user.id) return message.channel.send(`No.`);

        const bot = await Bots.findOne({ botid: user.id }, { _id: false })
        if (!bot) return message.channel.send(`No encontrado.`);

        const botUser = await this.client.users.fetch(user.id);
        if (bot.logo !== botUser.displayAvatarURL({format: "png", size: 256}))
            await Bots.updateOne({ botid: user.id }, {$set: {logo: botUser.displayAvatarURL({format: "png", size: 256})}});
        let e = new MessageEmbed()
            e.setColor(0x6b83aa)
            e.setAuthor(bot.username, botUser.displayAvatarURL({format: "png", size: 256}), bot.invite)
            e.setDescription(bot.description)
            e.addField(`Prefix`, bot.prefix ? bot.prefix : "Desconocido", true)
            if (typeof bot.support === 'undefined' || bot.support === null) {
                e.addField(`Servidor de soporte`, `No añadido`, true)
            } else {
                e.addField(`Servidor de soporte`, `[Click aqui](${bot.support})`, true)
            }
            if (typeof bot.website === 'undefined' || bot.website === null) {
                e.addField(`Sitio web`, `No añadido`, true)
            } else {
                e.addField(`Sitio web`, `[Click aqui](${bot.website})`, true)
            }
            if (typeof bot.github === 'undefined' || bot.github === null) {
                e.addField(`Github`, `No añadido`, true)
            } else {
                e.addField(`Github`, `[Click aqui](${bot.github})`, true)
            }
            if (typeof bot.likes === 'undefined' || bot.likes === null) {
                e.addField(`Votos`, `0 votos`, true)
            } else {
                e.addField(`Votos`, `${bot.likes} votos`, true)
            }
            e.addField(`Propietario`, `<@${bot.owners.primary}>`, true)
            e.addField(`Estado`, bot.state, true)
        message.channel.send(e);
    }
};
