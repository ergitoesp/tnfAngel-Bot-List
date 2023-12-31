const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');
const Bots = require("@models/bots");

const { server: {mod_log_id, role_ids} } = require("@root/config.json");

var modLog;

module.exports = class extends Command {
    constructor(...args) {
        super(...args, {
            aliases: ["verificar"],
            permissionLevel: 8,
            usage: '[User:user]',
            description: "Acepta un bot en la lista.",
        });
    }

    async run(message, [user]) {
        if (!user || !user.bot) return message.channel.send(`.`);
        let bot = await Bots.findOne({botid: user.id}, { _id: false });

        const botUser = await this.client.users.fetch(user.id);
        if (bot.logo !== botUser.displayAvatarURL({format: "png", size: 256}))
            await Bots.updateOne({ botid: user.id }, {$set: {state: "verified", logo: botUser.displayAvatarURL({format: "png", size: 256})}});
        else 
            await Bots.updateOne({ botid: user.id }, {$set: { state: "verified" } })
        
        let owners = [bot.owners.primary].concat(bot.owners.additional)
        let e = new MessageEmbed()
            .setTitle('Bot aceptado')
            .addField(`Bot`, `<@${bot.botid}>`, true)
            .addField(`Propietarios`, owners.map(x => x ? `<@${x}>` : ""), true)
            .addField("Responsable", message.author, true)
            .setThumbnail(botUser.displayAvatarURL({format: "png", size: 256}))
            .setTimestamp()
            .setColor(0x26ff00)
        modLog.send(e);
        modLog.send(owners.map(x => x ? `<@${x}>` : "")).then(m => { m.delete() });

        owners = await message.guild.members.fetch({user:owners})
        owners.forEach(o => {
            o.roles.add(message.guild.roles.cache.get(role_ids.bot_developer));
            o.send(`Tu bot \`${bot.username}\` Ha sido aceptado.`)
        })
        message.guild.members.fetch(message.client.users.cache.find(u => u.id === bot.botid)).then(bot => {
            bot.roles.set([role_ids.bot, role_ids.verified]);
        })
        message.channel.send(`\`${bot.username}\` ha sido aceptado.`);
    }

    async init() {
        modLog = this.client.channels.cache.get(mod_log_id);
    }
};