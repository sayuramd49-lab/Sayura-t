cmd({
  pattern: "menu2",
  react: "📁",
  alias: ["panel", "list", "commands"],
  desc: "Get bot's full command list.",
  category: "main",
  use: '.menu2',
  filename: __filename
}, async (conn, mek, m, { from, pushname, prefix, reply, l }) => {
  try {
    const os = require('os');
    const axios = require('axios');

    // Hosting platform
    let hostname;
    const hostLen = os.hostname().length;
    if (hostLen === 12) hostname = 'Replit';
    else if (hostLen === 36) hostname = 'Heroku';
    else if (hostLen === 8) hostname = 'Koyeb';
    else hostname = os.hostname();

    // RAM + Uptime
    const ramUsed = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
    const ramTotal = Math.round(os.totalmem() / 1024 / 1024);
    const ramUsage = `${ramUsed}MB / ${ramTotal}MB`;
    const rtime = await runtime(process.uptime());
    const number = conn.user.id.split(':')[0].replace(/@s\.whatsapp\.net$/, '');

    const caption = `*Hello ${pushname} 👋*\nI am *RAVANA-X-MD*\n\n⏰ Uptime: ${rtime}\n🚨 Host: ${hostname}\n🎡 Prefix: ${prefix}\n👤 User: ${pushname}\n⛵ RAM Usage: ${ramUsage}\n👨‍💻 Owner: ${number}\n⚖ Developers: RAVANA TEAM\n🧬 Version: 2.0.0\n💼 Work Type: ${config.WORK_TYPE}`;

    // Load image
    let imageBuffer;
    try {
      const res = await axios.get(config.LOGO, { responseType: 'arraybuffer' });
      imageBuffer = Buffer.from(res.data, 'binary');
    } catch {
      return reply("⚠️ Could not load menu image.");
    }

    // Generate full menu text
    let menuText = '';
    const categories = ['main','owner','group','movie','download','convert','logo','ai','search','other'];
    categories.forEach(cat => {
      menuText += `*─── ${cat.toUpperCase()} COMMANDS ───*\n`;
      commands.forEach(cmd => {
        if(cmd.category === cat && !cmd.dontAddCommandList) {
          menuText += `*│⚡ ${cmd.pattern}* → ${cmd.use || cmd.desc || ''}\n`;
        }
      });
      menuText += '\n';
    });

    // Toggle logic
    if(config.BUTTON === 'true') {
      // Button menu
      const buttons = [
        { buttonId: prefix+'mainmenu', buttonText: { displayText: 'MAIN' }, type: 1 },
        { buttonId: prefix+'ownermenu', buttonText: { displayText: 'OWNER' }, type: 1 },
        { buttonId: prefix+'groupmenu', buttonText: { displayText: 'GROUP' }, type: 1 },
        { buttonId: prefix+'moviemenu', buttonText: { displayText: 'MOVIE' }, type: 1 },
        { buttonId: prefix+'downloadmenu', buttonText: { displayText: 'DOWNLOAD' }, type: 1 },
        { buttonId: prefix+'convertmenu', buttonText: { displayText: 'CONVERT' }, type: 1 },
        { buttonId: prefix+'logomenu', buttonText: { displayText: 'LOGO' }, type: 1 },
        { buttonId: prefix+'aimenu', buttonText: { displayText: 'AI' }, type: 1 },
        { buttonId: prefix+'searchmenu', buttonText: { displayText: 'SEARCH' }, type: 1 },
        { buttonId: prefix+'othermenu', buttonText: { displayText: 'OTHER' }, type: 1 },
      ];

      await conn.buttonMessage(from, {
        image: imageBuffer,
        caption: menuText,
        footer: config.FOOTER,
        buttons,
        headerType: 4
      }, mek);

    } else {
      // List menu
      const listData = {
        title: "RAVANA-X-MD MENU",
        description: "Select a category to see commands",
        buttonText: "🔽 Open Menu",
        sections: categories.map(cat => ({
          title: cat.toUpperCase(),
          rows: commands
            .filter(cmd => cmd.category === cat && !cmd.dontAddCommandList)
            .map(cmd => ({
              title: cmd.pattern,
              description: cmd.use || cmd.desc || '',
              rowId: `${prefix}${cat}menu`
            }))
        }))
      };

      await conn.sendMessage(from, {
        text: caption,
        footer: config.FOOTER,
        templateButtons: [
          { index: 1, urlButton: { displayText: "🔽 Open Menu", url: "https://wa.me" } }
        ],
        viewOnce: true,
        headerType: 1
      }, { quoted: fkontak });
    }

  } catch (e) {
    reply('*❌ Error occurred!*');
    l(e);
  }
});
