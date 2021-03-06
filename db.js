const Sequelize = require('sequelize');
const pg = require('pg');
pg.defaults.ssl = { rejectUnauthorized: false }
const UserModel = require('./user');
const UserDetailsModel = require('./user-details');
const GameRegistersModel = require('./game-register.js');
const GameModel = require('./game.js');
const LanModel = require('./lan.js');
const LanPlayerRegisterModel = require('./lan-player-register.js');
const config = process.env;
const sequelize = new Sequelize(
    config.DATABASE_DB,
    config.DATABASE_USER,
    config.DATABASE_PASS,
    {
        dialect: 'postgres',
        ssl: true,
        host: config.DATABASE_HOST,
        port: 5432
    }
);
 
const models = {
  User: UserModel(sequelize, Sequelize.DataTypes),
  UserDetails: UserDetailsModel(sequelize, Sequelize.DataTypes),
  GameRegister: GameRegistersModel(sequelize, Sequelize.DataTypes),
  Game: GameModel(sequelize, Sequelize.DataTypes),
  Lan: LanModel(sequelize, Sequelize.DataTypes),
  LanPlayerRegister: LanPlayerRegisterModel(sequelize, Sequelize.DataTypes),
};
 
Object.keys(models).forEach(key => {
  if ('associate' in models[key]) {
    models[key].associate(models);
  }
});
 
module.exports = { sequelize, ...models, op: Sequelize.Op };