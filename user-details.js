const userDetails = (sequelize, DataTypes) => {
    const UserDetails = sequelize.define('user_details', {
        lanNumber: {
            type: DataTypes.INTEGER,
        },
        matchID: {
            type: DataTypes.INTEGER,
        },
        airshots: {
            type: DataTypes.INTEGER,
        },
        assists: {
            type: DataTypes.INTEGER,
        },
        clutch_1v1: {
            type: DataTypes.INTEGER,
        },
        clutch_1v2: {
            type: DataTypes.INTEGER,
        },
        clutch_1v3: {
            type: DataTypes.INTEGER,
        },
        clutch_1v4: {
            type: DataTypes.INTEGER,
        },
        clutch_1v5: {
            type: DataTypes.INTEGER,
        },
        damage_avg: {
            type: DataTypes.INTEGER,
        },
        deaths: {
            type: DataTypes.INTEGER,
        },
        first_deaths_ct: {
            type: DataTypes.INTEGER,
        },
        first_deaths_tt: {
            type: DataTypes.INTEGER,
        },
        first_kills_ct: {
            type: DataTypes.INTEGER,
        },
        first_kills_tt: {
            type: DataTypes.INTEGER,
        },
        headshots: {
            type: DataTypes.INTEGER,
        },
        kills: {
            type: DataTypes.INTEGER,
        },
        wallbangs: {
            type: DataTypes.INTEGER,
        },
        oneshots: {
            type: DataTypes.INTEGER,
        }
    },
    {
        indexes: [
            {
                unique: true,
                fields: ['userUserID', 'matchID']
            }
        ]
    });
   
    UserDetails.associate = models => {
        UserDetails.belongsTo(models.User);
    };
   
    return UserDetails;
  };
   
  module.exports = userDetails;