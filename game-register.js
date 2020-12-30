const GameRegister = (sequelize, DataTypes) => {
    const GameRegister = sequelize.define('game_register', {
        Team: {
            type: DataTypes.TEXT
        },
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
        GameRegister.belongsTo(models.Game);
    };

    return GameRegister;
  };
   
  module.exports = GameRegister;