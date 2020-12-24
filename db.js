const Sequelize = require('sequelize');
const pg = require('pg');
pg.defaults.ssl = { rejectUnauthorized: false }
const UserModel = require('./user');
const UserDetailsModel = require('./user-details');
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
  UserDetails: UserDetailsModel(sequelize, Sequelize.DataTypes)
};
 
Object.keys(models).forEach(key => {
  if ('associate' in models[key]) {
    models[key].associate(models);
  }
});
 
module.exports = { sequelize, ...models };