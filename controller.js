const { format, GET_MATCH, GET_MATCH_MEMBER_STATS, 
    queryPlayer, queryStats, playerData, matchData, extractDateTime } = require('./consts.js');
const url = `https://hasura.fastcup.net/v1/graphql`;
const axios = require('axios').default;
const { User, UserDetails, op, Game, GameRegister, 
    Lan, LanPlayerRegister } = require('./db.js');


const receiveData = async (ids, lanNumber) => {
    for (const id of ids) {
        playerData.id = id;
        matchData.matchID = id;
        const members = await fetchFromFastCup();
        const members2 = await fetchFromFastCup(false);
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
}

const allPlayers = async (lanNumber, UserID, aggregate, lanOnly = true) => {
    const where = {};
    const whereUserDetails = {};
    if (lanNumber) whereUserDetails.lanNumber = lanNumber;
    else if(lanOnly) {
        whereUserDetails.lanNumber = {
            [op.not]: 0
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
        return aggregateData(usersData);
    }
    return usersData;
}

const createNewGame = async (time) => {
    const gameActive = await Game.findOne({where: { Active: true }});
    if (gameActive) 
        throw new Error(gameActive.GameID);
    const gameID = await Game.create({
        Time: time,
        Active: true
    });

    return gameID;
}

const registerPlayerToGame = async (playerID) => {
    const gameActive = await Game.findOne({where: { Active: true }});
    if (!gameActive)
        return 'No active game';
    await GameRegister({  })
}

const createNewLan = async (date) => {
    const dateObject = extractDateTime(date);
    const lastLan = await Lan.findOne({order: [['LanID', 'DESC']]});
    if (lastLan) {
        const lastLanDateObject = extractDateTime(lastLan.Time);
        if ((dateObject <= lastLanDateObject) || (Date.now() >= lastLanDateObject)) {
            throw new Error('Lan already running');
        }
    }
    const newLan = await Lan.create({Time: date});
    return newLan;
};

const registerPlayerToLan = async(playerID, nickName) => {
    const player = await User.findOne({where: {UserID: playerID}});
    if (!player)
        await User.create({UserID: playerID, nickName});
    else 
        await User.update({nickName}, { where: {
                UserID: playerID
            }
        });
    const lastLan = await Lan.findOne({order: [['LanID', 'DESC']]});
    const lastLanDateObject = extractDateTime(lastLan.Time);
    if (Date.now() > lastLanDateObject) {
        throw new Error('No Lan to register to');
    }
    await LanPlayerRegister.create({UserID: playerID, LanID: lastLan.LanID});
    return;
}

const lastLanAndPlayers = async () => {
    const lastLan = await Lan.findOne({
        order: [['LanID', 'DESC']],
        include: [
            {
                model: User, 
                attributes: ['UserID', 'nickName']
            }
        ]
    });

    return lastLan;
}

const fetchFromFastCup = async (match = true) => {
    if (match) {
        const { data } = await axios.post(url, {query: queryPlayer, variables: playerData, operationName: GET_MATCH});
        return data.data.match.members;
    }
    const { data } = await axios.post(url, {query: queryStats, variables: matchData, operationName: GET_MATCH_MEMBER_STATS });
    return data.data.match_member_map_stats;
}

const aggregateData = (usersData) => usersData.reduce((prev, user) => {
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

module.exports = {
    allPlayers,
    receiveData,
    createNewGame,
    registerPlayerToGame,
    createNewLan,
    registerPlayerToLan,
    lastLanAndPlayers
}