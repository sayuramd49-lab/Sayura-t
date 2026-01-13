const config = require('../config')
const { cmd, commands } = require('../command')
const axios = require('axios');
const sharp = require('sharp');
const Seedr = require("seedr");
const { scrapercine, getDownloadLink } = require('../lib/yts'); 
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson} = require('../lib/functions')
const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));
const { Buffer } = require('buffer'); 
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const fileType = require("file-type")
const { x_search, x_info_dl } = require('../lib/newm'); 
const l = console.log
const https = require("https")
const { URL } = require('url');
const cinesubz_tv = require('sadasytsearch');
const { cinesubz_info, cinesubz_tv_firstdl, cinesubz_tvshow_info } = require('../lib/cineall');
const download = require('../lib/yts'); 
const { pirate_search, pirate_dl } = require('../lib/pirates');
const { gettep, down } = require('../lib/animeheaven');
const { sinhalasub_search, sinhalasub_info, sinhalasub_dl } = require('../lib/sinhalasubli');
const { sinhalasubb_search, sinhalasubtv_info, sinhalasubtv_dl } = require('../lib/sinhalasubtv');
const { slanimeclub_search, slanimeclub_ep, slanimeclub_dl, slanimeclub_mv_search, slanime_mv_info } = require('../lib/slanimeclub');
const { sizeFormatter} = require('human-readable');
const { xfull_search, xfull_dl } = require('../lib/plusmv');
const { search, getep, dl } = require('darksadasyt-anime')


cmd({
  pattern: "mv",
  react: "🔎",
  alias: ["movie", "film", "cinema"],
  desc: "all movie search",
  category: "movie",
  use: '.movie',
  filename: __filename
},
async (conn, mek, m, {
  from, prefix, l, quoted, q,
  isPre, isSudo, isOwner, isMe, reply
}) => {
  try {
    const pr = (await axios.get('https://raw.githubusercontent.com/RAVANA-PRODUCT/database/refs/heads/main/main_var.json')).data;
    const isFree = pr.mvfree === "true";

    // Premium check
    if (!isFree && !isMe && !isPre) {
      await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
      return await conn.sendMessage(from, {
        text: "*`You are not a premium user⚠️`*\n\n" +
              "*Send a message to one of the 2 numbers below and buy Lifetime premium 🫟.*\n\n" +
              "_Price : 2000 LKR ✔️_\n\n" +
              "*👨‍💻Contact us : 0771098429 , 0754871798*"
      }, { quoted: mek });
    }
	  
    // Block mode check
    if (config.MV_BLOCK === "true" && !isMe && !isSudo && !isOwner) {
      await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
      return await conn.sendMessage(from, {
        text: "*This command currently only works for the Bot owner. To disable it for others, use the .settings command 👨‍🔧.*"
      }, { quoted: mek });
    }

    if (!q) return await reply('*Enter movie name..🎬*');

    // Movie sources
    const sources = [
      { name: "CINESUBZ", cmd: "cine" },
      { name: "SINHALASUB", cmd: "sinhalasub" },
      { name: "YTSMX", cmd: "ytsmx" },
      { name: "BAISCOPES", cmd: "baiscopes" },
      { name: "PUPILVIDEO", cmd: "pupilvideo" },
      { name: "ANIMEHEAVEN", cmd: "animeheaven" },
      { name: "1377", cmd: "1377" },
      { name: "18 PLUS", cmd: "sexfull" },
      { name: "PIRATE", cmd: "pirate" },
      { name: "SLANIME", cmd: "slanime" },
      { name: "NIKI", cmd: "niki" },
	  { name: "CINESL", cmd: "cinesl" },
	{ name: "DINKA", cmd: "dinka" },
	{ name: "SUBLK", cmd: "sublk" },
	{ name: "SINHALASUBS", cmd: "sinhalasubs" }
    ];


    let imageBuffer;
    try {
      const res = await axios.get('https://files.catbox.moe/eqf9yk.jpg', {
        responseType: 'arraybuffer'
      });
      imageBuffer = Buffer.from(res.data, 'binary');
    } catch {
      imageBuffer = null; 
    }

    const caption = `_*RAVANA SEARCH SYSTEM 🎬*_\n\n*\`🔰Input :\`* ${q}\n\n_*🌟 Select your preferred movie download site*_`;

    if (config.BUTTON === "true") {
     
      const listButtons = {
        title: "❯❯ Choose a movie source ❮❮",
        sections: [
          {
            title: "❯❯ Choose a movie source ❮❮",
            rows: sources.map(src => ({
              title: `${src.name} Results 🎬`,
              id: prefix + src.cmd + ' ' + q
            }))
          }
        ]
      };

      return await conn.sendMessage(from, {
        image: imageBuffer || { url: 'https://files.catbox.moe/eqf9yk.jpg' },
        caption,
        footer: config.FOOTER,
        buttons: [
          {
            buttonId: "movie_menu_list",
            buttonText: { displayText: "🎥 Select Option" },
            type: 4,
            nativeFlowInfo: {
              name: "single_select",
              paramsJson: JSON.stringify(listButtons)
            }
          }
        ],
        headerType: 1,
        viewOnce: true
      }, { quoted: mek });

    } else {
  
      const buttons = sources.map(src => ({
        buttonId: prefix + src.cmd + ' ' + q,
        buttonText: { displayText: `_${src.name} Results 🍿_` },
        type: 1
      }));

      return await conn.buttonMessage2(from, {
        image: { url: 'https://files.catbox.moe/ccmrqx.jpg' },
        caption,
        footer: config.FOOTER,
        buttons,
        headerType: 4
      }, mek);
    }

  } catch (e) {
    reply('*❌ Error occurred*');
    l(e);
  }
});

//============================= TV SERIES COMMAND =====================================================

cmd({
  pattern: "tv",
  react: "🔎",
  alias: ["tvshows", "tvseries", "tvepisodes"],
  desc: "All TV shows search",
  use: ".tv squid game",
  category: "movie",
  filename: __filename
},
async (conn, mek, m, {
  from, prefix, l, q,
  isPre, isSudo, isOwner, isMe, reply
}) => {
  try {
    const pr = (await axios.get('https://raw.githubusercontent.com/RAVANA-PRODUCT/database/refs/heads/main/main_var.json')).data;
    const isFree = pr.mvfree === "true";

    // Premium check
    if (!isFree && !isMe && !isPre) {
      await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
      return await conn.sendMessage(from, {
        text: "*`You are not a premium user⚠️`*\n\n" +
              "*Send a message to one of the 2 numbers below and buy Lifetime premium 🫟.*\n\n" +
              "_Price : 2000 LKR ✔️_\n\n" +
              "*👨‍💻Contact us : 0771098429 , 0754871798*"
      }, { quoted: mek });
    }

    // Block mode check
    if (config.MV_BLOCK === "true" && !isMe && !isSudo && !isOwner) {
      await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
      return await conn.sendMessage(from, {
        text: "*This command currently only works for the Bot owner. To disable it for others, use the .settings command 👨‍🔧.*"
      }, { quoted: mek });
    }

    if (!q) return await reply('*Enter TV show name..📺*');

    // TV sources
    const sources = [
      { name: "CINESUBZ", cmd: "cinetv" },
      { name: "SINHALASUB", cmd: "sinhalasubtv" },
      { name: "SLANIME", cmd: "slanimetv" }
    ];

    // Load image buffer
    let imageBuffer;
    try {
      const res = await axios.get('https://files.catbox.moe/eqf9yk.jpg', {
        responseType: 'arraybuffer'
      });
      imageBuffer = Buffer.from(res.data, 'binary');
    } catch {
      imageBuffer = null; // fallback
    }

    const caption = `_*RAVANA SEARCH SYSTEM 📺*_\n\n*\`Input :\`* ${q}\n\n_*🌟 Select your preferred TV show site*_`;

    if (config.BUTTON === "true") {
      // NativeFlow list buttons
      const listButtons = {
        title: "❯❯ Choose a TV source ❮❮",
        sections: [
          {
            title: "❯❯ Choose a TV source ❮❮",
            rows: sources.map(src => ({
              title: `${src.name} Results 📺`,
              id: prefix + src.cmd + ' ' + q
            }))
          }
        ]
      };

      return await conn.sendMessage(from, {
        image: imageBuffer || { url: config.LOGO },
        caption,
        footer: config.FOOTER,
        buttons: [
          {
            buttonId: "tv_menu_list",
            buttonText: { displayText: "📺 Select Option" },
            type: 4,
            nativeFlowInfo: {
              name: "single_select",
              paramsJson: JSON.stringify(listButtons)
            }
          }
        ],
        headerType: 1,
        viewOnce: true
      }, { quoted: mek });

    } else {
      // Classic buttons fallback
      const buttons = sources.map(src => ({
        buttonId: prefix + src.cmd + ' ' + q,
        buttonText: { displayText: `_${src.name} Results 📺_` },
        type: 1
      }));

      return await conn.buttonMessage2(from, {
        image: { url: config.LOGO },
        caption,
        footer: config.FOOTER,
        buttons,
        headerType: 4
      }, mek);
    }

  } catch (e) {
    reply('*❌ Error occurred*');
    l(e);
  }
});

