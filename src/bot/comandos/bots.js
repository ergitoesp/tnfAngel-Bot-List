const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');
const Bots = require("@models/bots");

const {web: {domain_with_protocol}} = require("@root/config.json");

module.exports = class extends Command {
    constructor(...args) {
        super(...args, {
            usage: "[User:user]",
            description: "Comprueba que bots tiene un usuario."
        });
    }

    async run(message, [user]) {
        let person = user ? user : message.author;

        if (person.bot) return;

        let bots = await Bots.find({ $or: [{ "owners.primary": person.id },{ "owners.additional": person.id }], state: { $ne: "deleted" } }, { _id: false });

        if (bots.length === 0) return message.channel.send(`\`${person.tag}\` no tiene bots. Añade uno en: <${domain_with_protocol}/add/>.`)
        var cont = ``
        var un = false;
        for (let i = 0; i < bots.length; i++) {
            let bot = bots[i];
            if (bot.state == "unverified") {
                un = true
                cont += `<@${bot.botid}> (No verificado)\n`
            } else cont += `<@${bot.botid}>\n`
        }
        let e = new MessageEmbed()
            .setTitle(`Bots de ${person.username}#${person.discriminator}`)
            .setDescription(cont)
            .setColor(0x6b83aa)
        if (un) e.setFooter(`Tiene algunos bots pendientes de revisión.`)
        message.channel.send(e)
    }

};