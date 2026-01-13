const { cmd, commands } = require('../command');
const { getBuffer, runtime } = require('../lib/functions');
const config = require('../config');
const os = require('os');
const axios = require('axios');

const fkontak = {
    key: {
        remoteJid: "0@s.whatsapp.net",
        fromMe: false,
        id: "RAVANA"
    },
    message: {
        contactMessage: {
            displayName: "RAVANA-X-MD",
            vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:RAVANA-X-MD\nTEL;waid=${config.OWNER_NUMBER}:${config.OWNER_NUMBER}\nEND:VCARD`,
            sendEphemeral: false
        }
    }
};

cmd({
    pattern: "menu2",
    react: "📁",
    alias: ["panel", "commands", "menu2"],
    desc: "Show all bot commands",
    category: "main",
    filename: __filename
}, async (conn, mek, m, { from, pushname, prefix, reply, l }) => {
    try {
        // HOST info
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
        const number = config.OWNER_NUMBER;

        // Caption
        const caption = `*Hello ${pushname} 👋*\nI am *RAVANA-X-MD*\n
⏰ Uptime: ${rtime}
🚨 Host: ${hostname}
🎡 Prefix: ${config.PREFIX}
👤 User: ${pushname}
⛵ RAM Usage: ${ramUsage}
👨‍💻 Owner: ${number}
⚖ Developers: RAVANA TEAM
🧬 Version: 2.0.0
💼 Work Type: ${config.WORK_TYPE}`;

        // Load image buffer
        let imageBuffer;
        try {
            const res = await axios.get(config.LOGO, { responseType: 'arraybuffer' });
            imageBuffer = Buffer.from(res.data, 'binary');
        } catch (err) {
            console.error("❌ Failed to load logo:", err.message);
            return reply("⚠️ Could not load menu image.");
        }

        // Buttons array (for button menu)
        const buttons = [
            { buttonId: `${prefix}mainmenu`, buttonText: { displayText: 'MAIN MENU' }, type: 1 },
            { buttonId: `${prefix}ownermenu`, buttonText: { displayText: 'OWNER MENU' }, type: 1 },
            { buttonId: `${prefix}groupmenu`, buttonText: { displayText: 'GROUP MENU' }, type: 1 },
            { buttonId: `${prefix}moviemenu`, buttonText: { displayText: 'MOVIE MENU' }, type: 1 },
            { buttonId: `${prefix}downloadmenu`, buttonText: { displayText: 'DOWNLOAD MENU' }, type: 1 }
        ];

        if (config.BUTTON === 'true') {
            // LIST MENU
            const listData = {
                title: "RAVANA-X-MD Menu",
                description: "Select any category below 👇",
                buttonText: "🔽 Select Option",
                sections: [
                    {
                        title: "Menu Categories",
                        rows: [
                            { title: "MAIN COMMANDS", description: "Main commands", id: `${prefix}mainmenu` },
                            { title: "OWNER COMMANDS", description: "Owner commands", id: `${prefix}ownermenu` },
                            { title: "GROUP COMMANDS", description: "Group commands", id: `${prefix}groupmenu` },
                            { title: "MOVIE COMMANDS", description: "Movie commands", id: `${prefix}moviemenu` },
                            { title: "DOWNLOAD COMMANDS", description: "Download commands", id: `${prefix}downloadmenu` },
                            { title: "CONVERT COMMANDS", description: "Convert commands", id: `${prefix}convertmenu` },
                            { title: "AI COMMANDS", description: "AI commands", id: `${prefix}aimenu` },
                            { title: "LOGO COMMANDS", description: "Logo commands", id: `${prefix}logomenu` },
                            { title: "SEARCH COMMANDS", description: "Search commands", id: `${prefix}searchmenu` },
                            { title: "OTHER COMMANDS", description: "Other commands", id: `${prefix}othermenu` }
                        ]
                    }
                ]
            };

            return await conn.sendMessage(from, {
                image: imageBuffer,
                caption,
                footer: config.FOOTER,
                buttons: [{
                    buttonId: "list",
                    buttonText: { displayText: "🔽 Select Option" },
                    type: 4,
                    nativeFlowInfo: { name: "single_select", paramsJson: JSON.stringify(listData) }
                }],
                headerType: 1
            }, { quoted: fkontak });
        } else {
            // BUTTON MENU
            return await conn.sendMessage(from, {
                image: imageBuffer,
                caption,
                footer: config.FOOTER,
                buttons,
                headerType: 4
            }, { quoted: fkontak });
        }

    } catch (e) {
        reply('*❌ Error occurred!*');
        l(e);
    }
});
