const express = require('express');
const app = express();
const axios = require('axios').default;
const PORT = process.env.PORT || 5000
const url = `https://hasura.fastcup.net/v1/graphql`;
const { sequelize, User, UserDetails } = require('./db.js');
const { format, operationName, operationName2, 
    query, query2, variables, variables2 } = require('./consts.js');

const receiveData = async (ids, lanNumber) => {
    for (const id of ids) {
        variables.id = id;
        variables2.matchID = id;
        const { data } = await axios.post(url, {query, variables, operationName});
        const { data: data2 } = await axios.post(url, {query: query2, variables: variables2, operationName: operationName2});
        const members = data.data.match.members;
        const members2 = data2.data.match_member_map_stats;
        for (const member of members) {
            const member2 = members2.find(user => member.private.user.id === user.user_id);
            const user = await User.findOne({where: {UserID: member2.user_id}});
            if (!user) {
                await User.create({
                    UserID: member2.user_id,
                    nickName: member.private.user.nickName
                });
            }
            try {
                await UserDetails.create({...member2, lanNumber, matchID: member2.match_id, userUserID: member2.user_id});
                
            } catch (error) {
                console.log(error);
            }
        }
    }
    return sortable;
}

const allPlayers = async (lanNumber, UserID, aggregate, lanOnly = true) => {
    const where = {};
    const whereUserDetails = {};
    if (lanNumber) whereUserDetails.lanNumber = lanNumber;
    else if(lanOnly) {
        whereUserDetails.lanNumber = {
            [sequelize.Op.not]: 0
        };
    }
    else if(!lanOnly) {
        whereUserDetails.lanNumber = 0;
    }
    if (UserID) where.UserID = UserID;

    const usersData = await User.findAll({
        where,
        include: {
            model: UserDetails,
            where: whereUserDetails
        }
    });
    if (aggregate && usersData && usersData.length) {
        return usersData.reduce((prev, user) => {
            const data = user.user_details.reduce((prv, obj) => {
                    prv.kills+= obj.kills;
                    prv.deaths+= obj.deaths;
                    prv.assists+= obj.assists;
                    prv.damage_avg+= obj.damage_avg;
                    prv.headshots+= obj.headshots;
                    prv.wallbangs+= obj.wallbangs;
                    prv.fd+= obj.first_deaths_ct + obj.first_deaths_tt;
                    prv.fk+= obj.first_kills_ct + obj.first_kills_tt;
                    prv.oneshots+= obj.oneshots;
                    return prv;
            },{...format});
            data['k/d'] = data.kills / data.deaths;
            data.damage_avg = data.damage_avg / user.user_details.length;
            data.nickName = user.nickName;
            data.userID = user.UserID;
            prev.push(data);
            return prev;
        },[]);
    }
    return usersData;
}
(async () => {
    try {
        await sequelize.authenticate();
        // await sequelize.drop();
        await sequelize.sync();
    } catch (error) {
        throw new Error(error);
    }
    app.use(express.json());
    app.post('/add', async (req, res) => {
        const {ids, lanNumber} = req.body;
        await receiveData(ids, lanNumber);
        res.status(200).json({
            data: null,
            message: 'Done'
        });
    });

    app.post('/players', async (req, res) => {
        const { lanNumber, players, aggregate, lanOnly } = req.body;
        const data = await allPlayers(lanNumber, players, aggregate, lanOnly);
        res.status(200).json({data, message: 'OK'});
    })

    app.listen(PORT, () => console.log(`Listening on ${ PORT }`));
})();