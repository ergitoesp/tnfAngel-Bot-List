const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');
const Bots = require("@models/bots");

const { server: {mod_log_id, role_ids} } = require("@root/config.json");

const reasons = {
    "1": `El bot esta desconectado, por lo que somos incapaces de probar sus comandos. Porfavor, mantenga su bot online y reenvielo.`,
    "2": `El bot es un clon de otros bots.`,
    "3": `El bot responde a otros bots.`,
    "4": `El bot no tiene ningun comando o caracteristica. Porfavor, añada al menos 5 y reenvielo.`,
    "5": `El bot tiene comandos NSFW. En tnfAngel Bot List no queremos bots nsfw.`,
    "6": `El bot no tiene un menu de ayuda o un punto obio de entrada.`,
    "7": `Alguno de los comandos de tu bot, requieren permisos extra para ejecutarse. Elimine o cambie esto de no ser que sea extrictamente necesario, luego reenvielo.`,
    "8": `Alguno de los comandos de tu bot abusan de la API de discord, lo que causa ratelimit. Arregle esto y reenvielo.`,
    "9": `El owner primario fue baneado del servidor. Se le ha sido prohibido añadir bots.`
}
var modLog;

module.exports = class extends Command {
    constructor(...args) {
        super(...args, {
            runIn: ['text'],
            aliases: ["eliminar", "borrar"],
            permissionLevel: 8,
            botPerms: ["SEND_MESSAGES"],
            description: "Elimina un bot de la lista.",
            usage: '[Member:user]'
        });
    }

    async run(message, [Member]) {
        if (!Member || !Member.bot) return message.channel.send(`No has puesto ningun bot.`)
        let e = new MessageEmbed()
            .setTitle('Razones')
            .setColor(0x6b83aa)
            .addField(`Eliminando bot`, `${Member}`)
        let cont = ``;
        for (let k in reasons) {
            let r = reasons[k];
            cont += ` - **${k}**: ${r}\n`
        }
        cont += `\nPon un numero o una razon propia.`
        e.setDescription(cont)
        message.channel.send(e);
        let filter = m => m.author.id === message.author.id;

        let collected = await message.channel.awaitMessages(filter, { max: 1, time: 20000, errors: ['time'] });
        let reason = collected.first().content
        let r = collected.first().content;
        if (parseInt(reason)) {
            r = reasons[reason]
            if (!r) return message.channel.send("No has puesto un numero valido.")
        }

        let bot = await Bots.findOne({ botid: Member.id }, { _id: false });
        await Bots.updateOne({ botid: Member.id }, { $set: { state: "deleted", owners: {primary: bot.owners.primary, additional: []} } });
        const botUser = await this.client.users.fetch(Member.id);

        if (!bot) return message.channel.send(`El bot no existe.`)
        let owners = [bot.owners.primary].concat(bot.owners.additional)
        e = new MessageEmbed()
            .setTitle('Bot eliminado')
            .addField(`Bot`, `<@${bot.botid}>`, true)
            .addField(`Propietario`, owners.map(x => x ? `<@${x}>` : ""), true)
            .addField("Responsable", message.author, true)
            .addField("Motivo", r)
            .setThumbnail(botUser.displayAvatarURL({format: "png", size: 256}))
            .setTimestamp()
            .setColor(0xffaa00)
        modLog.send(e)
        modLog.send(owners.map(x => x ? `<@${x}>` : "")).then(m => { m.delete() });
        message.channel.send(`<@${bot.botid}> Ha sido eliminmado. Mira <#${mod_log_id}>.`)
        
        owners = await message.guild.members.fetch({user: owners})
        owners.forEach(o => {
            o.send(`Tu bot ${bot.username} ha sido eliminado:\n\`${r}\``)
        })
        if (!message.client.users.cache.find(u => u.id === bot.botid).bot) return;
        try {
            message.guild.members.fetch(message.client.users.cache.find(u => u.id === bot.botid))
                .then(bot => {
                    bot.kick().then(() => {})
                        .catch(e => { console.log(e) })
                }).catch(e => { console.log(e) });
        } catch (e) { console.log(e) }
    }

    async init() {
        modLog = this.client.channels.cache.get(mod_log_id);
    }
};
