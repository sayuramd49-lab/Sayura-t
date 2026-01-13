const config = require('../config');
const os = require('os');
const axios = require('axios');
const { cmd } = require('../command');
const { runtime } = require('../lib/functions');
const fkontak = {
    key: {
        remoteJid: "13135550002@s.whatsapp.net",
        participant: "0@s.whatsapp.net",
        fromMe: false,
        id: "Naze",
    },
    message: {
        contactMessage: {
            displayName: "𝐒𝐀𝐘𝐔𝐑𝐀-𝐗-𝐌𝐃",
            vcard: `BEGIN:VCARD\nVERSION:3.0\nN:XL;Meta AI;;;\nFN:Meta AI\nitem1.TEL;waid=94743826406:9472 628 0182\nitem1.X-ABLabel:Ponsel\nEND:VCARD`,
            sendEphemeral: false,
        },
    },
};

cmd({
    pattern: "menu",
    react: "📁",
    alias: ["panel", "list", "commands"],
    desc: "Get bot's command list.",
    category: "main",
    use: '.menu',
    filename: __filename
}, async (conn, mek, m, { from, pushname, prefix, reply, l }) => {
    try {
        // Host detection
        let hostname;
        const hostLen = os.hostname().length;
        if (hostLen === 12) hostname = 'Replit';
        else if (hostLen === 36) hostname = 'Heroku';
        else if (hostLen === 8) hostname = 'Koyeb';
        else hostname = os.hostname();

        // RAM + uptime
        const ramUsed = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
        const ramTotal = Math.round(os.totalmem() / 1024 / 1024);
        const ramUsage = `${ramUsed}MB / ${ramTotal}MB`;
        const rtime = await runtime(process.uptime());
        const number = conn.user.id.split(':')[0].replace(/@s\.whatsapp\.net$/, '');

        // Caption
        const caption = `*Hello ${pushname} 👋*\nI am *RAVANA-X-MD*\n\n` +
            `⏰ Uptime: ${rtime}\n` +
            `🚨 Host: ${hostname}\n` +
            `🎡 Prefix: ${config.PREFIX}\n` +
            `👤 User: ${pushname}\n` +
            `⛵ RAM Usage: ${ramUsage}\n` +
            `👨🏻‍💻 Owner: ${number}\n` +
            `⚖ Developers: RAVANA TEAM\n` +
            `🧬 Version: 2.0.0\n` +
            `💼 Work Type: ${config.WORK_TYPE}`;

        // Load logo image
        let imageBuffer;
        try {
            const res = await axios.get(config.LOGO, { responseType: 'arraybuffer' });
            imageBuffer = Buffer.from(res.data, 'binary');
        } catch (err) {
            console.error("❌ Failed to load image:", err.message);
            return reply("⚠️ Could not load menu image. Check your LOGO URL.");
        }

        // Buttons
        const buttons = [
            { buttonId: `${prefix}mainmenu`, buttonText: { displayText: 'MAIN COMMANDS' }, type: 1 },
            { buttonId: `${prefix}ownermenu`, buttonText: { displayText: 'OWNER COMMANDS' }, type: 1 },
        ];

        // List menu
        const listData = {
            title: "Select Menu :)",
            description: "Choose a command category",
            buttonText: "🔽 Select Option",
            sections: [
                {
                    title: "RAVANA-PRO",
                    rows: [
                        { title: "MAIN COMMANDS", description: "Main command menu", rowId: `${prefix}mainmenu` },
                        { title: "OWNER COMMANDS", description: "Owner command menu", rowId: `${prefix}ownermenu` },
                        { title: "GROUPS COMMANDS", description: "Group command menu", rowId: `${prefix}groupmenu` },
                        { title: "MOVIE COMMANDS", description: "Movie command menu", rowId: `${prefix}moviemenu` },
                        { title: "DOWNLOAD COMMANDS", description: "Download menu", rowId: `${prefix}downloadmenu` },
                        { title: "CONVERT COMMANDS", description: "Convert menu", rowId: `${prefix}convertmenu` },
                        { title: "SEARCH COMMANDS", description: "Search menu", rowId: `${prefix}searchmenu` },
                        { title: "LOGO COMMANDS", description: "Logo menu", rowId: `${prefix}logomenu` },
                        { title: "AI COMMANDS", description: "AI menu", rowId: `${prefix}aicommands` },
                        { title: "OTHER COMMANDS", description: "Other menu", rowId: `${prefix}othermenu` },
                    ]
                }
            ]
        };

        // Send image + text + buttons + list menu in one message
        await conn.sendMessage(from, {
            image: imageBuffer,
            caption,
            footer: config.FOOTER,
            hydratedButtons: buttons,
            hydratedTemplate: {
                type: "listMessage",
                ...listData
            }
        }, { quoted: fkontak });

    } catch (e) {
        reply('*❌ Error occurred!*');
        l(e);
    }
});
