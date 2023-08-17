const { Command } = require('klasa');
const fetch = require('node-fetch');
const Bots = require("@models/bots");

const { web: {domain_with_protocol} } = require("@root/config.json");

module.exports = class extends Command {
    constructor(...args) {
        super(...args, {
            usage: '[User:user]',
            description: "Mira el widget de un bot.",
        });
    }

    async run(message, [user]) {
        console.log(user)
        if (!user || !user.bot) return message.channel.send(`No has puesto ningun bot para obtener el widget.`);
        let url = `${domain_with_protocol}/api/embed/${user.id}`;
        let img = await fetch(url).then(res => res.buffer());
        message.channel.send({ files: [img] });
    }

};