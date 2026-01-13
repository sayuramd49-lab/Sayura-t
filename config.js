const fs = require('fs');
if (fs.existsSync('config.env')) require('dotenv').config({ path: './config.env' });
function convertToBool(text, fault = 'true') {
    return text === fault ? true : false;
}

//gg
module.exports = {
SESSION_ID: 'SAYURA-MD=5e1f3d2a-ff8f-4031-baff-71f673fd154c', // ONLY ("SAYURA-MD=")
ANTI_DELETE: process.env.ANTI_DELETE === undefined ? 'true' : process.env.ANTI_DELETE, 
MV_BLOCK: process.env. MV_BLOCK === undefined ? 'true' : process.env. MV_BLOCK,    
ANTI_LINK: process.env.ANTI_LINK === undefined ? 'true' : process.env.ANTI_LINK, 
SEEDR_MAIL: '',
SEEDR_PASSWORD: '',
SUDO: '',//
DB_NAME: 'SAYURA MD',
LANG: 'SI',
OWNER_NUMBER: '94743826406',
TG_GROUP: 'https://t.me/+ProRavanaTech'

};

// DONT USE OTHER SETTING 🫟

