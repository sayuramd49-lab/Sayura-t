const config = require('../config')
const { cmd, commands } = require('../command')
const axios = require('axios');
const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));

const apiKey = 'prabath_sk_5f6b6518b2aed4142f92d01f6c5f1026b88df3d3';

//=========================================================================================================================
// XVideos Search Command
//=========================================================================================================================

cmd({
    pattern: "xvideo1",
    alias: ["xv", "xvideos"],
    react: "🔞",
    category: "download",
    desc: "Search and download xvideos",
    filename: __filename
},
async (conn, m, mek, { from, q, prefix, reply }) => {
    try {
        if (!q) return await reply('*Please provide a search query! (e.g. .xvideo hot)*');

        // API Call for Search
        const res = await fetch('https://api.prabath.top/api/v1/dl/xvdl', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json', 
                'x-api-key': apiKey 
            },
            body: JSON.stringify({
                "query": q,
                "service": "xvideos" // සේවාව xvideos ලෙස සඳහන් කර ඇත
            })
        }).then(res => res.json());

        if (!res.data || res.data.length === 0) {
            return await reply('*No results found! ❌*');
        }

        const rowss = res.data.map((v) => ({
            title: v.title,
            id: prefix + `xvdl ${v.url}` // Download කිරීමට URL එක යවයි
        }));

        const listButtons = {
            title: "XVideos Search Results 🔞",
            sections: [{ title: "Select a video to download", rows: rowss }]
        };

        const caption = `*🔞 XVIDEOS SEARCH RESULTS*\n\n*\`Input :\`* ${q}`;

        if (config.BUTTON === "true") {
            await conn.sendMessage(from, {
                image: { url: 'https://files.catbox.moe/978m8i.jpg' }, // xvideos thumbnail එකක් හෝ වෙනත් එකක්
                caption: caption,
                footer: config.FOOTER,
                buttons: [{
                    buttonId: "xv_select",
                    buttonText: { displayText: "🎥 Select Video" },
                    type: 4,
                    nativeFlowInfo: { name: "single_select", paramsJson: JSON.stringify(listButtons) }
                }],
                viewOnce: true
            }, { quoted: mek });
        } else {
            let msg = caption + "\n\n";
            res.data.forEach((v, i) => {
                msg += `*${i + 1}.* ${v.title}\n`;
            });
            await reply(msg);
        }

    } catch (e) {
        console.log(e);
        await reply('🚩 *Error in XVideos Search API !!*');
    }
});

//=========================================================================================================================
// XVideos Downloader Command
//=========================================================================================================================

cmd({
    pattern: "xvdl",
    dontAddCommandList: true,
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return;

        await conn.sendMessage(from, { react: { text: '⏳', key: mek.key } });

        // API Call to get Download Link
        const res = await fetch('https://api.prabath.top/api/v1/dl/xvdl', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json', 
                'x-api-key': apiKey 
            },
            body: JSON.stringify({
                "query": q, // මෙහිදී q ලෙස ලැබෙන්නේ වීඩියෝ ලින්ක් එකයි
                "service": "xvideos"
            })
        }).then(res => res.json());

        // API ප්‍රතිචාරය අනුව direct link එක ලබා ගැනීම (මෙය ඔබේ API response එක අනුව වෙනස් විය හැක)
        const directLink = res.data.url || res.data.dl_link || res.data.direct;

        if (!directLink) return await reply("*🚩 Link generation failed!*");

        await conn.sendMessage(from, { text: '*Uploading your video...* ⬆️' });

        await conn.sendMessage(config.JID || from, {
            video: { url: directLink },
            caption: `*🔞 XVideos Downloader*\n\n${config.FOOTER}`,
            mimetype: "video/mp4",
            fileName: `xvideo.mp4`
        });

        await conn.sendMessage(from, { react: { text: '✔️', key: mek.key } });

    } catch (e) {
        console.error(e);
        await reply('🚩 *Download Failed !!*');
    }
});
