const LanPlayerRegister = (sequelize, DataTypes) => {
    const LanPlayerRegister = sequelize.define('lan_player_register', {
        LanID: {
            type: DataTypes.INTEGER,
            references: {
                model: sequelize.models.lan,
                key: 'LanID'
              }
        },
        UserID: {
            type: DataTypes.INTEGER,
            references: {
                model: sequelize.models.user,
                key: 'UserID'
              }
        }
    });
   
    return LanPlayerRegister;
  };
   
  module.exports = LanPlayerRegister;