const { Router } = require("express");
const { auth } = require("@utils/discordApi");
const Bots = require("@models/bots");
const { MessageEmbed } = require('discord.js');
const route = Router();

const { server: { id, role_ids, mod_log_id } } = require("@root/config.json")

route.post("/:id", auth, async function (req, res) {
    if (!req.user.staff) return res.json({ success: false, message: 'No eres staff' });

    
    const bot = await Bots.findOne({ "state": "unverified", botid: req.params.id }, { _id: false });
    if (!bot) return res.json({ success: false, message: 'Bot no encontrado' });

    
    let botUser = await req.app.get('client').users.fetch(req.params.id);
    await Bots.updateOne({ botid: req.params.id }, { $set: { state: "verified", logo: botUser.displayAvatarURL({ format: "png", size: 256 }) } });

    
    let owners = [bot.owners.primary].concat(bot.owners.additional)
    let modLog = await req.app.get('client').channels.cache.get(mod_log_id);
    modLog.send(
        new MessageEmbed()
            .setTitle('Bot aceptado')
            .addField(`Bot`, `<@${bot.botid}>`, true)
            .addField(`Propietarios`, owners.map(x => x ? `<@${x}>` : ""), true)
            .addField("Responsable", req.user.username, true)
            .setThumbnail(botUser.displayAvatarURL({format: "png", size: 256}))
            .setTimestamp()
            .setColor(0x26ff00)
        );
    modLog.send(owners.map(x => x ? `<@${x}>` : "")).then(m => { m.delete() });

    
    owners = await req.app.get('client').guilds.cache.get(id).members.fetch({user:owners})
    owners.forEach(o => {
        o.roles.add(req.app.get('client').guilds.cache.get(id).roles.cache.get(role_ids.bot_developer));
        o.send(`Tu bot \`${bot.username}\` fue aceptado.`)
    })

    // Update bot roles
    req.app.get('client').guilds.cache.get(id).members.fetch(req.params.id).then(member => {
        member.roles.set([role_ids.bot, role_ids.verified]);
    })

    return res.json({ success: true })
})

module.exports = route;