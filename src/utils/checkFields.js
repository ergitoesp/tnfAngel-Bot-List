const recaptcha2 = require('recaptcha2')
const is = require('is-html');

const { server: { id, admin_user_ids }, bot_options: { max_owners_count, max_bot_tags, bot_tags }, web: { recaptcha_v2: { site_key, secret_key } } } = require("@root/config.json");

const recaptcha = new recaptcha2({
    siteKey: site_key,
    secretKey: secret_key
})

function isValidUrl(string) {
    try { new URL(string); } 
    catch (_) { return false; }
    return true;
}

module.exports = async (req, b = null) => {
    let data = req.body;

    // User hasn't submitted a captcha
    if (!data.recaptcha_token)
        return { success: false, message: "No has puesto el captcha" }

    // Validate captcha
    try {
        await recaptcha.validate(data.recaptcha_token)
    } catch (e) {
        return { success: false, message: "El captcha no ha sido completado" }
    }

    // Max length for summary is 120 characters
    if (data.description.length > 120) return { success: false, message: "La descripcion corta no puede alcanzar los 120 caracteres." };

    // Check if summary has HTML.
    if (is(data.description))
        return { success: false, message: "La descripcion corta no puede contener HTML" }

    // Check that all the fields are filled in
    if (!data.long.length || !data.description.length || !data.prefix.length)
        return { success: false, message: "No has completado todos los campos." }
    
    // Check that all the links are valid
    if (data.invite && !isValidUrl(data.invite)) 
        return { success: false, message: "Invitacion del bot invalida" }
    if (data.support && !isValidUrl(data.support)) 
        return { success: false, message: "Servidor de soporte invalido" }
    if (data.website && !isValidUrl(data.website))
        return { success: false, message: "Sitio web invalido" }
    if (data.github && !isValidUrl(data.github))
        return { success: false, message: "El github es invalido" }

    // Check bot tags are valid
    if (data.tags) {
        if (!Array.isArray(data.tags))
            return { success: false, message: "Los tags son invalidos" }
        if (data.tags.length > max_bot_tags)
            return { success: false, message: `Tu bot no puede contener mas de ${max_bot_tags} etiquetas` }
        if (!data.tags.every(val => bot_tags.includes(val)))
            return { success: false, message: `Tags invalidos` }
    }
    
    // Check the user is in the main server.
    try {
        await req.app.get('client').guilds.cache.get(id).members.fetch(req.user.id);
    } catch (e) {
        return { success: false, message: "No estas en el servidor oficial", button: { text: "Unirse", url: "/join" } }

    }
    // Search for a user with discord
    let bot;
    try {
        bot = await req.app.get('client').users.fetch(req.params.id)
        if (!bot.bot)
            return { success: false, message: "La id del bot no es valida o no es un bot" }
    } catch (e) {
        // Invalid bot ID
        if (e.message.endsWith("is not snowflake.") || e.message == "Unknown User")
            return { success: false, message: "El bot es invalido" }
        else
            return { success: false, message: "No se puede encontrar el usuario" }
    }

    /* 
        Check that the user signed is either:
        - The primary owner
        - An additional owner
        - A server admin
    */
    if (
        b &&
        b.owners.primary !== req.user.id &&
        !b.owners.additional.includes(req.user.id) &&
        !req.user.staff
    )
        return { success: false, message: "oh oh, algo ha pasado. Intentalo de nuevo.", button: { text: "cerrar sesion", url: "/logout" } }

    // If the additional owners have been changed, check that the primary owner is editing it
    if (
        b &&
        data.owners.replace(',', '').split(' ').remove('').join() !== b.owners.additional.join() &&
        b.owners.primary !== req.user.id
    )
        return { success: false, message: "Solo el owner primario puede poner otros owners" };
  
    let users = []
    if (data.owners) 
        users = data.owners.replace(',', '').split(' ').remove('').filter(id => /[0-9]{16,20}/g.test(id))

    try {
        /* 
            Filter owners:
            - Is in the server
            - Is not a bot user
            - Is not duplicate
        */
        users = await req.app.get('client').guilds.cache.get(id).members.fetch({ user: users });
        users = [...new Set(users.map(x => { return x.user }).filter(user => !user.bot).map(u => u.id))];

        // Check if additional owners exceed max
        if (users.length > max_owners_count)
            return { success: false, message: `Solo puedes poner  ${max_owners_count} owners adicionales` };

        return { success: true, bot, users }
    } catch (e) {
        return { success: false, message: "Los owners son invalidos >:(" };
    }
}
