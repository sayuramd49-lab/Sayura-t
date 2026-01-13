
const config = require('../config')
const { cmd, commands } = require('../command')
const axios = require('axios');
const { fetchJson } = require('../lib/functions')
const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));

// API KEY
const API_KEY = "c56182a993f60b4f49cf97ab09886d17";

// ================================= SEARCH COMMAND =================================

cmd({
    pattern: "baiscopes",	
    react: '🔎',
    category: "movie",
    desc: "Baiscopes.lk movie search",
    use: ".baiscopes 2025",
    filename: __filename
},
async (conn, m, mek, { from, isPre, q, prefix, isMe, isSudo, isOwner, reply }) => {
try {
    const pr = (await axios.get('https://raw.githubusercontent.com/RAVANA-PRODUCT/database/refs/heads/main/main_var.json')).data;
    const isFree = pr.mvfree === "true";

    if (!isFree && !isMe && !isPre) {
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        return await reply("*`You are not a premium user⚠️`*");
    }

    if(!q) return await reply('*Please give me a search query!*')

    let url = await fetchJson(`https://sadaslk-apis.vercel.app/api/v1/movie/baiscopes/search?q=${q}&apiKey=${API_KEY}`)

    if (!url || !url.status || !url.data || url.data.length === 0) {
        return await reply('*No results found ❌*');
    }

    const caption = `*_BAISCOPES MOVIE SEARCH RESULT 🎬_*\n\n*\`Input :\`* ${q}`

    const rowss = url.data.map((v) => ({
        title: v.title || "No Title",
        id: prefix + `bdl ${v.link}`
    }));

    const listButtons = {
        title: "Choose a Movie :)",
        sections: [{ title: "Available Results", rows: rowss }]
    };

    if (config.BUTTON === "true") {
        await conn.sendMessage(from, {
            image: { url: config.LOGO },
            caption: caption,
            footer: config.FOOTER,
            buttons: [{
                buttonId: "download_list",
                buttonText: { displayText: "🎥 Select Movie" },
                type: 4,
                nativeFlowInfo: { name: "single_select", paramsJson: JSON.stringify(listButtons) }
            }],
            headerType: 1,
            viewOnce: true
        }, { quoted: mek });
    } else {
        let msg = caption + "\n\n";
        url.data.forEach((v, i) => { msg += `${i+1}. ${v.title}\n`; });
        await reply(msg);
    }

} catch (e) {
    console.error(e);
    await reply('🚩 *Error in Search !!*');
}
})

// ================================= DOWNLOAD LIST (bdl) =================================

cmd({
    pattern: "bdl",	
    react: '🎥',
    desc: "movie downloader",
    filename: __filename
},
async (conn, m, mek, { from, q, prefix, reply }) => {
try {
    if(!q) return;

    let sadas = await fetchJson(`https://sadaslk-apis.vercel.app/api/v1/movie/baiscopes/infodl?q=${q}&apiKey=${API_KEY}`)

    if (!sadas || !sadas.status || !sadas.data) return await reply('❌ Details not found!');

    const movie = sadas.data.movieInfo || {};
    const dlLinks = sadas.data.downloadLinks || [];
    
    // වැරදීමක් නොවීමට පින්තූරය පරීක්ෂා කිරීම
    let posterImg = config.LOGO;
    if (movie.galleryImages && Array.isArray(movie.galleryImages) && movie.galleryImages.length > 0) {
        posterImg = movie.galleryImages[0];
    }

    let msg = `*☘️ 𝗧ɪᴛʟᴇ ➮* *_${movie.title || 'N/A'}_*\n\n` +
              `*📅 𝗥ᴇʟᴇꜱᴇᴅ ➮* _${movie.releaseDate || 'N/A'}_\n` +
              `*💃 𝗥ᴀᴛɪɴɢ ➮* _${movie.ratingValue || 'N/A'}_\n` +
              `*⏰ 𝗥ᴜɴᴛɪᴍᴇ ➮* _${movie.runtime || 'N/A'}_\n` +
              `*🎭 𝗚ᴇɴᴀʀᴇｽ ➮* ${(movie.genres && Array.isArray(movie.genres)) ? movie.genres.join(', ') : 'N/A'}\n`

    if (dlLinks.length === 0) return await reply("❌ No download links available.");

    const rowss = dlLinks.map((v) => ({
        title: `${v.size || 'Unknown'} (${v.quality || 'N/A'})`,
        id: prefix + `cdl ${v.directLinkUrl}±${movie.title || 'Movie'}`
    }));

    const listButtons = {
        title: "🎬 Choose a download link :)",
        sections: [{ title: "Available Links", rows: rowss }]
    };

    if (config.BUTTON === "true") {
        await conn.sendMessage(from, {
            image: { url: posterImg },
            caption: msg,
            footer: config.FOOTER,
            buttons: [
                {
                    buttonId: prefix + `bdetails ${q}&${posterImg}`,
                    buttonText: { displayText: "Details Send" },
                    type: 1
                },
                {
                    buttonId: "download_list",
                    buttonText: { displayText: "🎥 Select Quality" },
                    type: 4,
                    nativeFlowInfo: { name: "single_select", paramsJson: JSON.stringify(listButtons) }
                }
            ],
            headerType: 1,
            viewOnce: true
        }, { quoted: mek });
    } else {
        await reply(msg + "\nUse buttons if available.");
    }

} catch (e) {
    console.error(e);
    await reply('🚩 *Error in Info Fetching !!*');
}
})

// ================================= DETAILS SEND (bdetails) =================================

cmd({
    pattern: "bdetails",
    react: '🎬',
    desc: "Movie details sender",
    filename: __filename
},
async (conn, m, mek, { from, q, reply }) => {
  try {
    if (!q || !q.includes('&')) return;

    const [url, imgUrl] = q.split("&");
    let sadas = await fetchJson(`https://sadaslk-apis.vercel.app/api/v1/movie/baiscopes/infodl?q=${url}&apiKey=${API_KEY}`);
    
    if (!sadas || !sadas.status) return;

    const movie = sadas.data.movieInfo;
    let detailsVar = { chlink: "" };
    try {
        detailsVar = (await axios.get('https://raw.githubusercontent.com/RAVANA-PRODUCT/database/refs/heads/main/main_var.json')).data;
    } catch (e) {}

    let msg = `*☘️ 𝗧ɪᴛʟᴇ ➮* *_${movie.title || 'N/A'}_*\n\n` +
              `*📅 𝗥ᴇʟᴇꜱᴇᴅ ➮* _${movie.releaseDate || 'N/A'}_\n` +
              `*💃 𝗥ᴀᴛɪɴɢ ➮* _${movie.ratingValue || 'N/A'}_\n` +
              `*⏰ 𝗥ᴜɴᴛɪᴍᴇ ➮* _${movie.runtime || 'N/A'}_\n` +
              `*🎭 𝗚ᴇɴᴀʀᴇｽ ➮* ${(movie.genres) ? movie.genres.join(', ') : 'N/A'}\n\n` +
              `✨ *Follow us:* ${detailsVar.chlink || ''}`;

    await conn.sendMessage(config.JID || from, {
      image: { url: imgUrl || config.LOGO },
      caption: msg
    });

    await conn.sendMessage(from, { react: { text: '✅', key: mek.key } });

  } catch (error) {
    console.error(error);
  }
});

// ================================= FINAL UPLOAD (cdl) =================================

// ================================= FINAL UPLOAD (cdl) =================================

cmd({
    pattern: "cdl",
    react: "⬇️",
    dontAddCommandList: true,
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q || !q.includes('±')) return;
        const [link, name] = q.split("±");
        
        // ලින්ක් එකේ ඇති හිස්තැන් (Spaces) URL එකට ගැළපෙන සේ සැකසීම
        const finalUrl = encodeURI(link.trim());

        await conn.sendMessage(from, { react: { text: '⬆️', key: mek.key } });
        await conn.sendMessage(from, { text: `*Uploading: ${name}* ⏳\n\n_Please wait, this may take a few minutes..._` });

        // axios මගින් file size එක හෝ stream එක පරීක්ෂා කර යැවීම වඩාත් ආරක්ෂිතයි
        await conn.sendMessage(config.JID || from, { 
            document: { url: finalUrl },
            caption: `*🎬 Name :* ${name}\n\n${config.NAME}`,
            mimetype: "video/mp4",
            fileName: `${name}.mp4`
        });

        await conn.sendMessage(from, { react: { text: '✔️', key: mek.key } });

    } catch (e) { 
        console.error(e);
        // Error එක Console එකේ පෙන්වයි. 9.9kb එන්නේ බොහෝ විට link එකට server එකට access නැති නිසයි.
        await reply("*Upload Error!* ❌\n_The file could not be fetched. This might be a link protection issue._");
    }
});
