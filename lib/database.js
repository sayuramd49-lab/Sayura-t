
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const config = require("../config");

// ================= DATABASE FOLDER =================
const databaseFolder = path.join(__dirname, "database");

if (!fs.existsSync(databaseFolder)) {
  fs.mkdirSync(databaseFolder, { recursive: true });
}

// ================= SCHEMA =================
const settingsSchema = new mongoose.Schema({
  OWNER_NUMBER: { type: String, default: "94743826406" },
  MV_SIZE: { type: String, default: "0" },
  NAME: { type: String, default: "" },
  JID: { type: String, default: "" },

  SEEDR_MAIL: { type: String, default: "" },
  SEEDR_PASSWORD: { type: String, default: "" },

  LANG: { type: String, default: "SI" },
  PREFIX: { type: String, default: "." },
  WORK_TYPE: { type: String, default: "private" },

  SUDO: { type: [String], default: [] },
  JID_BLOCK: { type: [String], default: [] },
  ANTI_BAD: { type: [String], default: [] },
  AUTO_WELCOME_LEAVE: { type: [String], default: [] },
  VALUSE: { type: [String], default: [] },

  MAX_SIZE: { type: Number, default: 150 },

  ANTI_CALL: { type: String, default: "false" },
  AUTO_READ_STATUS: { type: String, default: "false" },
  AUTO_BLOCK: { type: String, default: "false" },
  AUTO_STICKER: { type: String, default: "false" },
  AUTO_VOICE: { type: String, default: "false" },
  AUTO_REACT: { type: String, default: "false" },
  CMD_ONLY_READ: { type: String, default: "true" },
  XNXX_BLOCK: { type: String, default: "true" },
  AUTO_MSG_READ: { type: String, default: "false" },
  AUTO_TYPING: { type: String, default: "false" },
  AUTO_RECORDING: { type: String, default: "false" },
  ANTI_LINK: { type: String, default: "false" },
  ANTI_BOT: { type: String, default: "false" },
  CHAT_BOT: { type: String, default: "false" },
  ALLWAYS_OFFLINE: { type: String, default: "false" },
  MV_BLOCK: { type: String, default: "true" },
  BUTTON: { type: String, default: "false" },

  ACTION: { type: String, default: "delete" },
  ANTILINK_ACTION: { type: String, default: "delete" },

  ALIVE: { type: String, default: "default" },
  ANTI_DELETE: { type: String, default: "off" },

  LEAVE_MSG: { type: String, default: "" },
  AUTO_STATUS_REACT: { type: String, default: "true" },
  CUSTOM_REACT: { type: String, default: "" },

  LOGO: { type: String, default: "https://files.catbox.moe/m94645.jpg" },
  MAINMENU: { type: String, default: "https://files.catbox.moe/eqf9yk.jpg" },
  GROUPMENU: { type: String, default: "https://files.catbox.moe/eqf9yk.jpg" },
  OWNERMENU: { type: String, default: "https://files.catbox.moe/eqf9yk.jpg" },
  CONVERTMENU: { type: String, default: "https://files.catbox.moe/eqf9yk.jpg" },
  AIMENU: { type: String, default: "https://files.catbox.moe/eqf9yk.jpg" },
  LOGOMENU: { type: String, default: "https://files.catbox.moe/eqf9yk.jpg" },
  DOWNMENU: { type: String, default: "https://files.catbox.moe/eqf9yk.jpg" },
  SEARCHMENU: { type: String, default: "https://files.catbox.moe/eqf9yk.jpg" },
  OTHERMENU: { type: String, default: "https://files.catbox.moe/eqf9yk.jpg" },
  MOVIEMENU: { type: String, default: "https://files.catbox.moe/eqf9yk.jpg" }
});

// ================= MODEL =================
const Settings = mongoose.model(config.DB_NAME, settingsSchema);

// ================= CONNECT DB (HARDCODE URL) =================
async function connectdb() {
  try {
    await mongoose.connect(
      "mongodb://mongo:CfffUCVKyrOgnsLnEFernUcAlrTeiiDG@trolley.proxy.rlwy.net:20937"
    );

    console.log("Database connected 🛢️");

    const count = await Settings.countDocuments();
    if (count === 0) {
      await initializeSettings();
    }
  } catch (err) {
    console.error(" ├ Database connection error:", err);
  }
}

// ================= INIT =================
async function initializeSettings() {
  const settings = new Settings();
  await settings.save();
  console.log("Settings initialized 🫟");
}

// ================= JSON HELPERS =================
async function readJsonFile(filePath) {
  return JSON.parse(await fs.promises.readFile(filePath, "utf8"));
}

async function writeJsonFile(filePath, data) {
  await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2));
  return true;
}

// ================= CMD STORE =================
async function updateCMDStore(MsgID, CmdID) {
  try {
    const filePath = path.join(databaseFolder, "data.json");
    const olds = fs.existsSync(filePath) ? await readJsonFile(filePath) : [];
    olds.push({ [MsgID]: CmdID });
    await writeJsonFile(filePath, olds);
    return true;
  } catch (e) {
    console.log("Error updating command store:", e);
    return false;
  }
}

async function isbtnID(MsgID) {
  try {
    const filePath = path.join(databaseFolder, "data.json");
    const olds = fs.existsSync(filePath) ? await readJsonFile(filePath) : [];
    return olds.some(item => item[MsgID]);
  } catch {
    return false;
  }
}

async function getCMDStore(MsgID) {
  try {
    const filePath = path.join(databaseFolder, "data.json");
    const olds = fs.existsSync(filePath) ? await readJsonFile(filePath) : [];
    const found = olds.find(item => item[MsgID]);
    return found ? found[MsgID] : null;
  } catch {
    return null;
  }
}

// ================= SETTINGS OPS =================
async function input(setting, data) {
  const settings = await Settings.findOne();
  if (settings && setting in settings) {
    settings[setting] = data;
    await settings.save();
  }
}

async function get(setting) {
  const settings = await Settings.findOne();
  return settings ? settings[setting] : null;
}

async function getalls() {
  const settings = await Settings.findOne();
  return settings ? settings.toJSON() : null;
}

async function updb() {
  const settings = await Settings.findOne();
  if (settings) Object.assign(config, settings.toObject());
  console.log("Database updated ✅");
}

async function resetSettings() {
  await Settings.deleteMany();
  await initializeSettings();
}

async function updfb() {
  await resetSettings();
  console.log("Database reset and initialized ✅");
}

async function upresbtn() {
  await writeJsonFile(path.join(databaseFolder, "data.json"), []);
  console.log(" ├ Command store reset ✅");
}

// ================= START =================
connectdb();

// ================= EXPORT =================
module.exports = {
  connectdb,
  updateCMDStore,
  isbtnID,
  getCMDStore,
  input,
  get,
  getalls,
  updb,
  updfb,
  upresbtn
};















