const user = (sequelize, DataTypes) => {
    const User = sequelize.define('user', {
        UserID: {
            type: DataTypes.INTEGER,
            primaryKey: true
        },
        nickName: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false
        },
    });
   
    User.associate = models => {
      User.hasMany(models.UserDetails);
      User.hasMany(models.GameRegister);
      User.belongsToMany(models.Lan, {through: models.LanPlayerRegister, foreignKey: 'UserID'});
    };

    return User;
  };
   
  module.exports = user;