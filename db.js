const Sequelize = require('sequelize');
const pg = require('pg');
pg.defaults.ssl = { rejectUnauthorized: false }
const UserModel = require('./user');
const UserDetailsModel = require('./user-details');
const sequelize = new Sequelize(
    'd6toplsnvget54',
    'plvsgcjmeuxiso',
    '7a63c17e66a9b5c92326431ee767c983dfd225eaf338e7e8aff196662797e858',
    {
        dialect: 'postgres',
        ssl: true,
        host: 'ec2-23-23-88-216.compute-1.amazonaws.com',
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