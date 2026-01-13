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


//=============


cmd({
    pattern: "sinhalasub",
    react: '🔎',
    category: "movie",
    alias: ["sinsub", "sinhalasub"],
    desc: "Search movies on sinhalasub.lk",
    use: ".sinhalasub <movie name>",
    filename: __filename
},
async (conn, m, mek, { from, q, prefix, isPre, isMe, isSudo, isOwner, reply }) => {
    try {
        // 🧩 Premium check
        const pr = (await axios.get('https://raw.githubusercontent.com/RAVANA-PRODUCT/database/refs/heads/main/main_var.json')).data;
        const isFree = pr.mvfree === "true";

        if (!isFree && !isMe && !isPre) {
            await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
            return await conn.sendMessage(from, {
                text: "*`You are not a premium user⚠️`*\n\n" +
                      "*Send a message to one of the 2 numbers below and buy Lifetime premium 📤.*\n\n" +
                      "_Price : 100 LKR ✔️_\n\n" +
                      "*👨‍💻Contact us : 94754871798*"
            }, { quoted: mek });
        }

        if (config.MV_BLOCK == "true" && !isMe && !isSudo && !isOwner) {
            await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
            return await conn.sendMessage(from, { 
                text: "*This command currently only works for the Bot owner. To disable it for others, use the .settings command 👨‍🔧.*" 
            }, { quoted: mek });
        }

        if (!q) return await reply('*Please enter a movie name! 🎬*');

        // 🔗 Fetch SinhalaSub API
        const { data: apiRes } = await axios.get(`https://visper-md-ap-is.vercel.app/movie/sinhalasub/search?q=${encodeURIComponent(q)}`);

        // 🧠 Normalize structure
        let results = [];
        if (Array.isArray(apiRes)) results = apiRes;
        else if (Array.isArray(apiRes.result)) results = apiRes.result;
        else if (Array.isArray(apiRes.results)) results = apiRes.results;
        else if (Array.isArray(apiRes.data)) results = apiRes.data;
        else results = [];

        if (!results.length) {
            await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
            return await conn.sendMessage(from, { text: '*No results found ❌*' }, { quoted: mek });
        }

        // 🧩 Create list
        let srh = results.map(v => ({
            title: (v.Title || v.title || "Unknown Title")
                .replace(/Sinhala Subtitles\s*\|?\s*සිංහල උපසිරසි.*/gi, "")
                .trim(),
            description: "",
            rowId: prefix + 'sininfo ' + (v.Link || v.link || "")
        }));

        const sections = [{
            title: "sinhalasub.lk results",
            rows: srh
        }];

        const listMessage = {
            text: `_*SINHALASUB MOVIE SEARCH RESULTS 🎬*_\n\n*🔎 Input:* ${q}`,
            footer: config.FOOTER,
            title: 'sinhalasub.lk Results 🎥',
            buttonText: '*Reply Below Number 🔢*',
            sections
        };

        const caption = `_*SINHALASUB MOVIE SEARCH RESULTS 🎬*_\n\n*🏔️ Input:* ${q}`;

        // 🎛️ Interactive button or list
        if (config.BUTTON === "true") {
            const listButtons = {
                title: "Choose a Movie 🎬",
                sections: [
                    {
                        title: "Available Movies",
                        rows: srh
                    }
                ]
            };

            await conn.sendMessage(from, {
                image: { url: config.LOGO },
                caption: caption,
                footer: config.FOOTER,
                buttons: [
                    {
                        buttonId: "download_list",
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
            await conn.listMessage(from, listMessage, mek);
        }

    } catch (e) {
        console.error("🔥 SinhalaSub Error:", e);
        reply('🚫 *Error Occurred !!*\n\n' + e.message);
    }
});

//=========

cmd({
    pattern: "sininfo",
    alias: ["mdv"],
    use: '.moviedl <url>',
    react: "🎥",
    desc: "Download movies from sinhalasub.lk",
    filename: __filename
},

async (conn, mek, m, { from, q, prefix, isMe, isOwner, reply }) => {
try {
    if (!q) return reply('🚩 *Please give me a valid movie URL!*');

    // 🔍 Validate URL
    if (!q.includes('https://sinhalasub.lk/movies/')) {
        return await reply('*❗ This appears to be a TV series. Please use the .tv command instead.*');
    }

    // 🧠 Fetch movie info from your API
    const { data: sadass } = await axios.get(`https://visper-md-ap-is.vercel.app/movie/sinhalasub/info?q=${encodeURIComponent(q)}`);
    const sadas = sadass.result;

    if (!sadas || Object.keys(sadas).length === 0)
        return await conn.sendMessage(from, { text: "🚩 *I couldn't find any movie info 😔*" }, { quoted: mek });

    // 🎬 Movie info caption
    const msg = `*🌾 𝗧ɪᴛʟᴇ ➮* *_${sadas.title || 'N/A'}_*

*📅 𝗥𝗲𝗹𝗲𝗮𝘀𝗲𝗱 𝗗𝗮𝘁𝗲 ➮* _${sadas.date || 'N/A'}_
*🌎 𝗖𝗼𝘂𝗻𝘁𝗿𝘆 ➮* _${sadas.country || 'N/A'}_
*💃 𝗥𝗮𝘁𝗶𝗻𝗴 ➮* _${sadas.rating || 'N/A'}_
*⏰ 𝗥𝘂𝗻𝘁𝗶𝗺𝗲 ➮* _${sadas.duration || 'N/A'}_
*🕵️ 𝗦𝘂𝗯𝘁𝗶𝘁𝗹𝗲 𝗕𝘆 ➮* _${sadas.author || 'N/A'}_
`;

    // 🧩 Create buttons
    const rows = [
        { buttonId: prefix + 'daqt ' + q, buttonText: { displayText: '💡 Send Details' }, type: 1 },
        { buttonId: prefix + 'ch ' + q, buttonText: { displayText: '🖼️ Send Images' }, type: 1 }
    ];

    // Add download links
    if (sadas.downloadLinks && sadas.downloadLinks.length > 0) {
        sadas.downloadLinks.forEach(v => {
            rows.push({
                buttonId: prefix + `sindl ${v.link}±${sadas.images?.[1] || ''}±${sadas.title}`,
                buttonText: { displayText: `${v.size || 'N/A'} - ${v.quality || 'Unknown Quality'}` },
                type: 1
            });
        });
    }

    // 🧾 Prepare list menu
    const listRows = (sadas.downloadLinks || []).map(v => ({
        title: `${v.size} - ${v.quality}`,
        id: prefix + `sindl ${v.link}±${sadas.images?.[1] || ''}±${sadas.title}`
    }));

    const listButtons = {
        title: "🎬 Choose a download link :)",
        sections: [{ title: "Available Download Links", rows: listRows }]
    };

    // 🖼️ Image + Caption
    const movieImage = sadas.images?.[0] || config.LOGO;

    // ✅ BUTTON MODE ENABLED
    if (config.BUTTON === "true") {
        await conn.sendMessage(from, {
            image: { url: movieImage },
            caption: msg,
            footer: config.FOOTER,
            buttons: [
                { buttonId: prefix + 'daqt ' + q, buttonText: { displayText: "Details" }, type: 1 },
                { buttonId: prefix + 'ch ' + q, buttonText: { displayText: "Images" }, type: 1 },
                {
                    buttonId: "download_list",
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
        // ✅ NORMAL MODE
        await conn.sendMessage(from, {
            image: { url: movieImage },
            caption: msg,
            footer: config.FOOTER,
            buttons: rows,
            headerType: 4
        }, { quoted: mek });
    }

} catch (e) {
    console.log(e);
    reply('🚫 *Error Occurred !!*\n\n' + e);
}
});


let isUploadinggg = false; // Track upload status

//================

cmd({
    pattern: "sindl",
    react: "⬇️",
    dontAddCommandList: true,
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    if (isUploadinggg) {
        return await conn.sendMessage(from, { 
            text: '*A movie is already being uploaded. Please wait until it finishes.* ⏳', 
            quoted: mek 
        });
    }
console.log(`Input:`, q)
    try {
        //===================================================
        const [pix, imglink, title] = q.split("±");
        if (!pix || !imglink || !title) return await reply("⚠️ Invalid format. Use:\n`sindl link±img±title`");
        //===================================================

        const da = pix.split("https://pixeldrain.com/u/")[1];
		console.log(da)
        if (!da) return await reply("⚠️ Couldn’t extract Pixeldrain file ID.");

        const fhd = `https://pixeldrain.com/api/file/${da}`;
        isUploadinggg = true; // lock start

        //===================================================
        const botimg = imglink.trim();
    // Send "uploading..." msg without blocking
        conn.sendMessage(from, { text: '*Uploading your movie.. ⬆️*', quoted: mek });
 await conn.sendMessage(config.JID || from, { 
                document: { url: fhd },
                caption: `🎬 ${title}\n\n${config.NAME}\n\n${config.FOOTER}`,
                mimetype: "video/mp4",
                //jpegThumbnail: await (await fetch(botimg)).buffer(),
                fileName: `🎬 Ｒᴀᴠᴀɴᴀ－Ｘ－Ｍᴅ 🎬${title}.mp4`
            });
		
     
            
            conn.sendMessage(from, { react: { text: '✔️', key: mek.key } }),
            conn.sendMessage(from, { text: `*Movie sent successfully  ✔*`, quoted: mek })
       

    } catch (e) {
        reply('🚫 *Error Occurred !!*\n\n' + e.message);
        console.error("sindl error:", e);
    } finally {
        isUploadinggg = false; // reset lock always
    }
});


//=============

cmd({
    pattern: "daqt",
    alias: ["mdv"],
    use: '.moviedl <url>',
    react: "🎥",
    desc: "Send full movie details from sinhalasub.lk",
    filename: __filename
},

async (conn, mek, m, { from, q, prefix, reply }) => {
try {
    if (!q) return reply('🚩 *Please give me a valid movie URL!*');

    // ✅ Fetch movie info from API
    const { data } = await axios.get(`https://visper-md-ap-is.vercel.app/movie/sinhalasub/info?q=${encodeURIComponent(q)}`);
    const sadas = data.result;

    if (!sadas || Object.keys(sadas).length === 0)
        return await reply('*🚫 No details found for this movie!*');

    // ✅ Fetch extra details (for footer / channel link)
    const details = (await axios.get('https://raw.githubusercontent.com/RAVANA-PRODUCT/database/refs/heads/main/main_var.json')).data;

    // 🧾 Caption Template
    const msg = `*🍿 𝗧ɪᴛʟᴇ ➮* *_${sadas.title || 'N/A'}_*

*📅 𝗥𝗲𝗹𝗲𝗮𝘀𝗲𝗱 𝗗𝗮𝘁𝗲 ➮* _${sadas.date || 'N/A'}_
*🌎 𝗖𝗼𝘂𝗻𝘁𝗿𝘆 ➮* _${sadas.country || 'N/A'}_
*💃 𝗥𝗮𝘁𝗶𝗻𝗴 ➮* _${sadas.rating || 'N/A'}_
*⏰ 𝗥𝘂𝗻𝘁𝗶𝗺𝗲 ➮* _${sadas.duration || 'N/A'}_
*🕵️‍♀️ 𝗦𝘂𝗯𝘁𝗶𝘁𝗹𝗲 𝗕𝘆 ➮* _${sadas.author || 'N/A'}_

> 🌟 *Follow us :* ${details.chlink || 'N/A'}
`;

    // ✅ Send movie info message
    await conn.sendMessage(
        config.JID || from,
        {
            image: { url: sadas.images?.[0] || config.LOGO },
            caption: msg,
            footer: config.FOOTER || "🎬 Ｒᴀᴠᴀɴᴀ－Ｘ－Ｍᴅ 🎬",
        },
        { quoted: mek }
    );

    // ✅ React confirmation
    await conn.sendMessage(from, { react: { text: '✔️', key: mek.key } });

} catch (error) {
    console.error('Error fetching or sending:', error);
    await conn.sendMessage(from, { text: `🚫 *Error Occurred While Fetching Movie Data!* \n\n${error.message}` }, { quoted: mek });
}
});

//===============

