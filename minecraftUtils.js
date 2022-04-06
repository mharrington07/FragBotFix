"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateCatacombsLevel = exports.skinFromUUID = exports.uuidFromUsername = exports.usernameFromUUID = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
async function usernameFromUUID(uuid) {
    const data = await (await (0, node_fetch_1.default)(`https://api.mojang.com/user/profile/${uuid}/names`)).text();
    return JSON.parse(data)[JSON.parse(data).length - 1].name;
}
exports.usernameFromUUID = usernameFromUUID;
async function uuidFromUsername(username) {
    const data = await (await (0, node_fetch_1.default)(`https://api.mojang.com/users/profiles/minecraft/` + username)).text();
    return JSON.parse(data).id;
}
exports.uuidFromUsername = uuidFromUsername;
async function skinFromUUID(uuid) {
    const data = await (await (0, node_fetch_1.default)(`https://crafatar.com/avatars/${uuid}`)).arrayBuffer();
    return Buffer.from(data);
}
exports.skinFromUUID = skinFromUUID;
async function calculateCatacombsLevel(apikey, uuid) {
    const data = await (await (0, node_fetch_1.default)("https://api.hypixel.net/skyblock/profiles?key=" + apikey + "&uuid=" + uuid));
    const profiles = JSON.parse(await data.text()).profiles;
    const xp = profiles[Object.keys(profiles).length - 1].members[uuid].dungeons.dungeon_types.catacombs.experience;
    const catacombsLvls = [50, 75, 110, 160, 230, 330, 470, 670, 950, 1340, 1890, 2665, 3760, 5260, 7380, 10300, 14400, 20000, 27600, 38000, 52500, 71500, 97000, 132000, 180000, 243000, 328000, 445000, 600000, 800000, 1065000, 1410000, 1900000, 2500000, 3300000, 4300000, 5600000, 7200000, 9200000, 12000000, 15000000, 19000000, 24000000, 30000000, 38000000, 48000000, 60000000, 75000000, 93000000, 116250000];
    let lvl = 0;
    for (const level in catacombsLvls) {
        lvl += catacombsLvls[level];
        if (xp <= lvl) {
            return parseInt(level);
        }
    }
    return 0;
}
exports.calculateCatacombsLevel = calculateCatacombsLevel;
//# sourceMappingURL=minecraftUtils.js.map