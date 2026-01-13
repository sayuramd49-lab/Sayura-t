const config = require('../config')
const os = require('os')
const axios = require('axios');
const { cmd, commands } = require('../command')
const { runtime } = require('../lib/functions')
const fkontak = {
    key: {
        remoteJid: "0@s.whatsapp.net",
        participant: "0@s.whatsapp.net",
        fromMe: false,
        id: "AliveCheck",
    },
    message: {
        contactMessage: {
            displayName: "𝐒𝐀𝐘𝐔𝐑𝐀-𝐗-𝐌𝐃",
            vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:Meta AI\nTEL;waid=94743826406:+94726280182\nEND:VCARD`,
            sendEphemeral: false,
        },
    },
};

cmd({
  pattern: "alive",
  react: "📡",
  alias: ["online", "bot", "test", "ravana"],
  desc: "Check if bot is online.",
  category: "main",
  use: ".alive",
  filename: __filename
}, 
async (conn, mek, m, context) => {
    const { from, prefix, pushname, reply, l } = context;
    try {
        // Host detection
        const hostnameLength = os.hostname().length;
        let hostname = "Unknown";
        if(hostnameLength === 12) hostname = 'Replit';
        else if(hostnameLength === 36) hostname = 'Heroku';
        else if(hostnameLength === 8) hostname = 'Koyeb';
        else hostname = os.hostname();

        // RAM & Uptime
        const ramUsed = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
        const ramTotal = Math.round(os.totalmem() / 1024 / 1024);
        const ramUsage = `${ramUsed} MB / ${ramTotal} MB`;
        const rtime = await runtime(process.uptime());

        // Buttons
        const baseButtons = [
            { buttonId: prefix+'menu', buttonText: { displayText: '𝐒𝐀𝐘𝐔𝐑𝐀 𝐌𝐄𝐍𝐔' }, type: 1 },
            { buttonId: prefix+'ping', buttonText: { displayText: '𝐒𝐀𝐘𝐔𝐑𝐀 𝐏𝐎𝐖𝐄𝐑' }, type: 1 },
            { buttonId: prefix+'system', buttonText: { displayText: '𝐒𝐀𝐘𝐔𝐑𝐀 𝐈𝐍𝐅𝐎' }, type: 1 }
        ];

        // List for options (if needed)
        const listButtons = {
            title: "Command Menu",
            sections: [
                {
                    title: "Main Commands",
                    rows: [
                        { title: "Command Menu", description: "Show command menu", id: prefix+'menu' },
                        { title: "Bot Speed", description: "Check bot speed", id: prefix+'ping' }
                    ]
                }
            ]
        };

        // Default ALIVE message
        if(config.ALIVE === "default") {
            const details = (await axios.get('https://raw.githubusercontent.com/sayuramd49-lab/Data/refs/heads/main/main_var.json')).data;
            const defaultMessage = {
                image: { url: config.LOGO },
                caption: `*Hello ${pushname} 👋*  
I am alive now 🎈
*┌───────────┐*
*├ ⏰ Uptime* : ${rtime}
*├ 🚨 Host* : ${hostname}
*├ 🎡 Prefix* : ${config.PREFIX}
*├ 👤 User* : ${pushname}
*├ ⛵ RAM Usage* : ${ramUsage}
*├ ⚖ Developers* : RAVANA TEAM
*├ 🧬 Version* : 2.0.0
*└───────────┘*
*🔗 Links:*  
• GitHub Repo: ${details.reponame}  
• WhatsApp Channel: ${details.chlink}`,
                footer: config.FOOTER,
                buttons: baseButtons,
                headerType: 4
            };
            return await conn.buttonMessage2(from, defaultMessage);
        }

        // Custom ALIVE
        const caption = config.ALIVE;

        if(config.BUTTON === 'true') {
            // Send with selectable list
            return await conn.sendMessage(
                from,
                {
                    image: { url: config.LOGO },
                    caption,
                    footer: config.FOOTER,
                    buttons: [
                        {
                            buttonId: "select_option",
                            buttonText: { displayText: "🎥 Select Option" },
                            type: 4,
                            nativeFlowInfo: {
                                name: "single_select",
                                paramsJson: JSON.stringify(listButtons)
                            }
                        }
                    ],
                    headerType: 1
                    // viewOnce removed
                },
                { quoted: mek }
            );
        } else {
            // Send normal buttons
            const customMessage = {
                image: { url: config.LOGO },
                caption,
                footer: config.FOOTER,
                buttons: baseButtons,
                headerType: 4
                // viewOnce removed
            };
            return await conn.buttonMessage2(from, customMessage, mek);
        }

    } catch(error) {
        reply('*❌ Error occurred while checking bot status!*');
        l(error);
    }
});
