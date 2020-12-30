const GameRegister = (sequelize, DataTypes) => {
    const GameRegister = sequelize.define('game_register', {
        GameID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        Time: {
            type: DataTypes.TEXT
        },
        Active: {
            type: DataTypes.BOOLEAN
        }
    },
    {
        indexes: [
            {
                unique: true,
                fields: ['GameID']
            }
        ]
    });
   
    GameRegister.associate = models => {
        GameRegister.belongsTo(models.User);
    };
   
    return GameRegister;
  };
   
  module.exports = GameRegister;