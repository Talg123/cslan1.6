const Lan = (sequelize, DataTypes) => {
    const Lan = sequelize.define('lan', {
        LanID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        Time: {
            type: DataTypes.TEXT
        }
    });
   
    Lan.associate = models => {
       Lan.belongsToMany(models.User, {through: models.LanPlayerRegister, foreignKey: 'LanID'});
    };
   
    return Lan;
  };
   
  module.exports = Lan;