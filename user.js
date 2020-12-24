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
    };
   
    return User;
  };
   
  module.exports = user;