const config = require('../config');
const os = require('os');
const axios = require('axios');
const { cmd, commands } = require('../command');
const { runtime } = require('../lib/functions');
const { buttonMessage } = require('@whiskeysockets/baileys');

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
      vcard: `BEGIN:VCARD\nVERSION:3.0\nN:XL;Meta AI;;;\nFN:Meta AI\nitem1.TEL;waid=94743826406:94726280182\nitem1.X-ABLabel:Ponsel\nEND:VCARD`,
      sendEphemeral: false,
    },
  },
};

cmd({
  pattern: "menu",
  react: "📁",
  alias: ["panel","list","commands"],
  desc: "Get bot's command list.",
  category: "main",
  use: '.menu',
  filename: __filename
}, async (conn, mek, m, { from, pushname, prefix, reply, l }) => {
  try {
    // Host detection
    let hostLen = os.hostname().length;
    let hostname = hostLen === 12 ? 'Replit' : hostLen === 36 ? 'Heroku' : hostLen === 8 ? 'Koyeb' : os.hostname();

    // RAM + uptime
    const ramUsed = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
    const ramTotal = Math.round(os.totalmem() / 1024 / 1024);
    const ramUsage = `${ramUsed}MB / ${ramTotal}MB`;
    const rtime = await runtime(process.uptime());

    // Guard conn.user
    const number = conn.user ? conn.user.id.split(':')[0].replace(/@s\.whatsapp\.net$/, '') : 'unknown';

    const caption = `*Hello ${pushname} 👋*\nI am *RAVANA-X-MD*\n\n⏰ Uptime: ${rtime}\n🚨 Host: ${hostname}\n🎡 Prefix: ${config.PREFIX}\n👤 User: ${pushname}\n⛵ RAM Usage: ${ramUsage}\n👨‍💻 Owner: ${number}\n⚖ Developers: RAVANA TEAM\n🧬 Version: 2.0.0\n💼 Work Type: ${config.WORK_TYPE}`;

    // Load image
    let imageBuffer;
    try {
      if(!config.LOGO.startsWith('http')) throw new Error("Invalid LOGO URL");
      const res = await axios.get(config.LOGO, { responseType: 'arraybuffer' });
      imageBuffer = Buffer.from(res.data, 'binary');
    } catch(err) {
      console.error("❌ Failed to load image:", err.message);
      return reply("⚠️ Could not load menu image. Check LOGO URL.");
    }

    // Buttons
    const buttons = [
      { buttonId: prefix + 'mainmenu', buttonText: { displayText: 'ＭＡＩＮ ＣＯＭＭＡＮＤＳ' }, type: 1 },
      { buttonId: prefix + 'ownermenu', buttonText: { displayText: 'ＯＷＮＥＲ ＣＯＭＭＡＮＤＳ' }, type: 1 },
      { buttonId: prefix + 'groupmenu', buttonText: { displayText: 'ＧＲＯＵＰＳ ＣＯＭＭＡＮＤＳ' }, type: 1 },
      { buttonId: prefix + 'moviemenu', buttonText: { displayText: 'ＭＯＶＩＥ ＣＯＭＭＡＮＤＳ' }, type: 1 },
      { buttonId: prefix + 'downloadmenu', buttonText: { displayText: 'ＤＯＷＮＬＯＡＤ ＣＯＭＭＡＮＤＳ' }, type: 1 }
    ];

    // Button vs List toggle
    if(config.BUTTON === 'true'){
      const listData = {
        title: "Select Menu :)",
        sections: [{
          title: "RAVANA-PRO",
          rows: commands.filter(c => !c.dontAddCommandList).map(c => ({
            title: `${c.pattern.toUpperCase()} COMMAND`,
            description: c.desc || c.use || "No description",
            id: `${prefix}${c.pattern}`
          }))
        }]
      };

      return await conn.sendMessage(from, {
        image: imageBuffer,
        caption,
        footer: config.FOOTER,
        buttons: [
          { buttonId: "action", buttonText: { displayText: "🔽 Select Option" }, type: 4, nativeFlowInfo: { name: "single_select", paramsJson: JSON.stringify(listData) } }
        ],
        headerType: 1,
        viewOnce: true
      }, { quoted: fkontak });
    } else {
      await conn.buttonMessage(from, { image: imageBuffer, caption, footer: config.FOOTER, buttons, headerType: 4 }, mek);
    }

  } catch (e) {
    reply('*❌ Error occurred!*');
    l(e);
  }
});
