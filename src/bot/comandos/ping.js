const { Command } = require('klasa');

module.exports = class extends Command {
    constructor(...args) {
        super(...args, {
            runIn: ['text'],
            aliases: ["pong", "latency"],
            description: "Comprueba la latencia del botardo."
        });
    }

    async run(message, [...params]) {
        let now = Date.now()
        let m = await message.channel.send(`Pingeando...`);
        m.edit(`:ping_pong: Pong! \`${Date.now() - now}\`ms`)
    }

};