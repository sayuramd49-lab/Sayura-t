const { cmd, commands } = require('../command');
const { getBuffer, runtime } = require('../lib/functions');
const config = require('../config');

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

// ---------------------- FULL MENU -----------------------
cmd({
  pattern: "menu2",
  react: "📁",
  alias: ["panel","list","commands"],
  desc: "Get full bot command list",
  category: "main",
  use: ".menu",
  filename: __filename
}, async (conn, mek, m, { from, pushname, prefix, reply, l }) => {
  try {
    const rtime = await runtime(process.uptime());
    const os = require('os');
    const hostname = os.hostname();
    const ramUsage = `${(process.memoryUsage().heapUsed/1024/1024).toFixed(2)}MB / ${Math.round(os.totalmem()/1024/1024)}MB`;
    const number = conn.user.id.split(':')[0].replace(/@s\.whatsapp\.net$/, '');
    const caption = `*Hello ${pushname} 👋*\nI am *RAVANA-X-MD*\n\n⏰ Uptime: ${rtime}\n🚨 Host: ${hostname}\n🎡 Prefix: ${config.PREFIX}\n👤 User: ${pushname}\n⛵ RAM Usage: ${ramUsage}\n👨‍💻 Owner: ${number}\n⚖ Developers: RAVANA TEAM\n🧬 Version: 2.0.0\n💼 Work Type: ${config.WORK_TYPE}`;

    const imageBuffer = await getBuffer(config.LOGO);

    const hydratedButtons = [
      { buttonId: `${prefix}mainmenu`, buttonText: { displayText: "MAIN MENU" }, type: 1 },
      { buttonId: `${prefix}ownermenu`, buttonText: { displayText: "OWNER MENU" }, type: 1 },
      { buttonId: `${prefix}system`, buttonText: { displayText: "SYSTEM INFO" }, type: 1 },
    ];

    const categories = [
      { key: "main", title: "MAIN COMMANDS", desc: "All main commands" },
      { key: "owner", title: "OWNER COMMANDS", desc: "Owner only commands" },
      { key: "group", title: "GROUP COMMANDS", desc: "Group related commands" },
      { key: "movie", title: "MOVIE COMMANDS", desc: "Movie commands" },
      { key: "download", title: "DOWNLOAD COMMANDS", desc: "Download commands" },
      { key: "convert", title: "CONVERT COMMANDS", desc: "Convert commands" },
      { key: "search", title: "SEARCH COMMANDS", desc: "Search commands" },
      { key: "logo", title: "LOGO COMMANDS", desc: "Logo commands" },
      { key: "ai", title: "AI COMMANDS", desc: "AI commands" },
      { key: "other", title: "OTHER COMMANDS", desc: "Other miscellaneous commands" },
    ];

    const rows = categories.map(cat => ({
      title: cat.title,
      description: cat.desc,
      rowId: `${prefix}${cat.key}menu`
    }));

    const listMessage = {
      title: "📂 RAVANA-PRO MENU",
      description: "Select a category to see commands",
      buttonText: "🔽 Select Menu",
      footerText: config.FOOTER,
      sections: [{ title: "Categories", rows }]
    };

    await conn.sendMessage(from, {
      image: imageBuffer,
      caption,
      footer: config.FOOTER,
      hydratedButtons,
      hydratedTemplate: { type: "listMessage", ...listMessage }
    }, { quoted: fkontak });

  } catch (e) {
    reply("*❌ Error occurred!*");
    l(e);
  }
});

// ---------------------- CATEGORY MENUS -----------------------
const categories = [
  { key: "main", name: "MAIN", icon: "🏮" },
  { key: "owner", name: "OWNER", icon: "💎" },
  { key: "group", name: "GROUP", icon: "🎩" },
  { key: "movie", name: "MOVIE", icon: "🎞" },
  { key: "download", name: "DOWNLOAD", icon: "🍁" },
  { key: "convert", name: "CONVERT", icon: "🗃️" },
  { key: "search", name: "SEARCH", icon: "🔍" },
  { key: "logo", name: "LOGO", icon: "🎨" },
  { key: "ai", name: "AI", icon: "🤖" },
  { key: "other", name: "OTHER", icon: "⚒" },
];

categories.forEach(cat => {
  cmd({
    pattern: `${cat.key}menu`,
    react: cat.icon,
    dontAddCommandList: true,
    filename: __filename
  }, async(conn, mek, m, { from, prefix, reply }) => {
    try{
      let list = "";
      for (let i=0;i<commands.length;i++){
        if(commands[i].category === cat.key && !commands[i].dontAddCommandList){
          list += `*│${cat.icon} Command:* ${commands[i].pattern}\n*│Use:* ${commands[i].use || commands[i].desc || 'No description'}\n\n`;
        }
      }

      const menuc = `*╭──────────●●►*\n${list}*╰──────────●●►*`;

      const buttons = [
        { buttonId: `${prefix}sc`, buttonText: { displayText: "GET BOT SCRIPT" }, type: 1 },
        { buttonId: `${prefix}ping`, buttonText: { displayText: "GET BOT PING" }, type: 1 }
      ];

      const buttonMessage = {
        image: { url: config.LOGO },
        caption: menuc,
        footer: config.FOOTER,
        headerType: 4,
        buttons
      };

      await conn.buttonMessage(from, buttonMessage, mek);

    } catch(e){
      reply("*❌ ERROR!*");
      l(e);
    }
  });
});

// ---------------------- SYSTEM INFO -----------------------
cmd({
  pattern: "system",
  alias: ["status"],
  desc: "Check bot system status.",
  category: "main",
  use: '.system',
  filename: __filename
}, async (conn, mek, m, { reply, from }) => {
  try {
    const os = require('os');
    const hostname = os.hostname();
    const ramUsage = `${(process.memoryUsage().heapUsed/1024/1024).toFixed(2)}MB / ${Math.round(os.totalmem()/1024/1024)}MB`;
    const rtime = await runtime(process.uptime());
    const sysInfo = `*📡 RAVANA SYSTEM INFO 📡*\n⏰ Uptime: ${rtime}\n🗃 RAM Usage: ${ramUsage}\n⚓ Platform: ${hostname}\n🧬 Version: 2.0.0\n👨‍💻 Developers: RAVANA TEAM`;
    await conn.sendMessage(from, { text: sysInfo }, { quoted: fkontak });
  } catch(e){
    reply("*❌ Error fetching system info!*");
    console.error(e);
  }
});
