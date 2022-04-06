"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const UserModel_1 = require("./model/UserModel");
const config_json_1 = __importDefault(require("../config.json"));
const sequelize = new sequelize_1.Sequelize('database', 'username', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: __dirname + "/db/users.sqlite",
});
(0, UserModel_1.UserModel)(sequelize);
sequelize.sync().then(async () => {
    console.log('Database created');
    await sequelize.close();
    for (const admin of config_json_1.default.admins) {
        console.log(admin);
        const { users } = require("./dbObjects");
        await users.create({
            uuid: admin,
            isAdmin: true
        });
    }
}).catch(console.error);
//# sourceMappingURL=dbinit.js.map