"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mineflayer_1 = require("mineflayer");
const config_json_1 = __importDefault(require("./config.json"));
const funni_json_1 = __importDefault(require("./funni.json"));
const p_ratelimit_1 = require("p-ratelimit");
const Queue_1 = __importDefault(require("./Queue"));
const dbObjects_1 = require("./database/dbObjects");
const minecraftUtils_1 = require("./utils/minecraftUtils");
const sequelize_1 = require("sequelize");
const discord_js_1 = __importStar(require("discord.js"));
const dbot = new discord_js_1.default.Client();
const limit = (0, p_ratelimit_1.pRateLimit)({
    interval: 1000,
    rate: 1,
    concurrency: 1,
    end() {
    }
});
let bot = (0, mineflayer_1.createBot)({
    host: config_json_1.default.host,
    version: config_json_1.default.version,
    username: config_json_1.default.username,
    password: config_json_1.default.password,
    auth: config_json_1.default.auth,
    logErrors: true
});
const queue = new Queue_1.default();
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
async function sendMessage(message, shuffle = false) {
    await limit(() => (async () => bot.chat(message + (shuffle ? " " + ("ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('').sort(() => 0.5 - Math.random()).join('')) : "")))());
}
bot.addChatPatternSet("PARTY_WARP", [/^Party Leader, (?:\[(.+\+?\+?)\] )?(.+), summoned you to their server./], {
    parse: true,
    repeat: true
});
bot.addChatPatternSet("PARTY_INVITE", [/^-----------------------------\n(?:\[(.+\+?\+?)\] )?(.+) has invited you to join their party!\nYou have 60 seconds to accept. Click here to join!\n-----------------------------/], {
    parse: true,
    repeat: true
});
bot.addChatPatternSet("EXPIRED_PARTY", [/The party invite from (\[[A-z+]*])? ?([A-z0-9_]+) has expired./], {
    parse: true,
    repeat: true
});
bot.addChatPatternSet("PRIVATE_MESSAGE", [/^From (?:\[(.+\+?\+?)\] )?(.+): (.+)$/], {
    parse: true,
    repeat: true
});
dbot.on("message", async (message) => {
    if (message.channel instanceof discord_js_1.DMChannel)
        return;
    if (message.content.startsWith(config_json_1.default.prefix)) {
        const args = message.content.slice(config_json_1.default.prefix.length).trim().split(/ +/g);
        const cmd = args.shift()?.toLowerCase();
        switch (cmd) {
            case "list":
                let msg = "Current users of the fragbot: ";
                for (const user of await dbObjects_1.users.findAll()) {
                    const username = await (0, minecraftUtils_1.usernameFromUUID)(user.getDataValue("uuid"));
                    msg += `**${username}**, `;
                }
                await message.channel.send(msg);
                break;
            case "add":
                await dbObjects_1.users.create({
                    uuid: await (0, minecraftUtils_1.uuidFromUsername)(args[0]),
                    isAdmin: false
                });
                await message.channel.send(args[0] + ` added! They should be able to use me now!`);
                break;
            case "remove":
                await dbObjects_1.users.destroy({
                    where: {
                        uuid: {
                            [sequelize_1.Op.like]: `%${await (0, minecraftUtils_1.uuidFromUsername)(args[0])}%`
                        }
                    }
                });
                await message.channel.send(args[0] + ` removed! They should no longer be able to use me!`);
                break;
        }
    }
});
bot.once("spawn", async () => {
    console.log("logged in and spawned!");
    await sendMessage("/achat §");
});
let busy = false;
async function clearQueue() {
    if (busy) {
        return;
    }
    ;
    busy = true;
    while (!queue.isEmpty()) {
        const username = queue.peek();
        await sendMessage(`/p accept ${username}`);
        const randomfuni = funni_json_1.default[Math.floor(Math.random() * funni_json_1.default.length)];
        await sendMessage(`/pc ${randomfuni}. gonna leave in 5 seconds!`);
        await sleep(5000);
        await sendMessage("/p leave");
        queue.pull();
    }
    busy = false;
}
// @ts-ignore
bot.on("chat:PARTY_WARP", async ([[_, username]]) => {
    await sendMessage("/achat §");
});
// @ts-ignore
bot.on("chat:PARTY_INVITE", async ([[_, username]]) => {
    const uuid = await (0, minecraftUtils_1.uuidFromUsername)(username);
    const user = await dbObjects_1.users.findOne({ where: { uuid: { [sequelize_1.Op.like]: `%${uuid}%` } } });
    if (!user)
        return;
    queue.push(username);
    await clearQueue();
    const file = new discord_js_1.default.MessageAttachment(await (0, minecraftUtils_1.skinFromUUID)(uuid), 'img.jpeg');
    const embed = new discord_js_1.default.MessageEmbed()
        .setTitle("FragBot logs")
        .setDescription(`**${username}** just partied me! \nQueue length: ${queue.length()}`)
        .setThumbnail('attachment://img.jpeg')
        .setColor('#0099ff')
        .setTimestamp()
        .attachFiles([file]);
    const channel = dbot.channels.cache.get(config_json_1.default.announce_channel);
    if (channel) {
        await channel.send(embed);
    }
});
// @ts-ignore
bot.on("chat:EXPIRED_PARTY", async ([[_, username]]) => {
    const uuid = await (0, minecraftUtils_1.uuidFromUsername)(username);
    const user = await dbObjects_1.users.findOne({ where: { uuid: { [sequelize_1.Op.like]: `%${uuid}%` } } });
    if (user) {
        queue.splice(username);
    }
});
// @ts-ignore
bot.on("chat:PRIVATE_MESSAGE", async ([[_, username, message]]) => {
    const uuid = await (0, minecraftUtils_1.uuidFromUsername)(username);
    const user = await dbObjects_1.users.findOne({ where: { uuid: { [sequelize_1.Op.like]: `%${uuid}%` } } });
    if (!user || user.getDataValue("isAdmin") === 0)
        return;
    if (message.startsWith(config_json_1.default.prefix)) {
        const args = message.slice(config_json_1.default.prefix.length).trim().split(/ +/g);
        const cmd = args.shift()?.toLowerCase();
        if (cmd === "execute") {
            await sendMessage(args.join(" "));
            await sendMessage(`/msg ${username} command executed successfully!`, true);
        }
    }
});
bot.on("end", () => {
    bot = (0, mineflayer_1.createBot)({
        host: config_json_1.default.host,
        version: config_json_1.default.version,
        username: config_json_1.default.username,
        password: config_json_1.default.password,
        auth: config_json_1.default.auth,
        logErrors: true
    });
});
dbot.login(config_json_1.default.token);
//# sourceMappingURL=fragBot.js.map