"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.users = void 0;
const sequelize_1 = require("sequelize");
const UserModel_1 = require("./model/UserModel");
const sequelize = new sequelize_1.Sequelize('database', 'username', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: __dirname + "/db/users.sqlite",
});
const users = (0, UserModel_1.UserModel)(sequelize);
exports.users = users;
//# sourceMappingURL=dbObjects.js.map