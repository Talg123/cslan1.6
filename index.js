const express = require('express');
const app = express();
const axios = require('axios').default;
const PORT = process.env.PORT || 5000
const url = `https://hasura.fastcup.net/v1/graphql`;
const { sequelize, User, UserDetails } = require('./db.js');

const query = "fragment match_member on match_members {  match_id  hash  ready  match_team_id  rating_diff  connected  is_leaver  kills  deaths  assists  private {    party_id    rating    user {      id      nickName: nick_name      avatar      online      isMobile: is_mobile      link      stats(        where: {game_id: {_eq: $gameID}, map_id: {_is_null: true}, game_mode_id: {_is_null: false}}      ) {        gameModeID: game_mode_id        rating        __typename      }      city {        id        regionID: region_id        name_ru        name_uk        name_en        name_de        name_pl        name_pt        name_es        name_hbs        name_tr        __typename      }      country {        id        name_ru        name_uk        name_en        name_de        name_pl        name_pt        name_es        name_hbs        name_tr        iso2        __typename      }      __typename    }    __typename  }  __typename}query GetMatch($id: Int!, $gameID: smallint!) {  match: matches_by_pk(id: $id) {    id    status    game_status    has_winner    created_at    started_at    finished_at    readiness_passed    last_update    server_instance_id    teamspeak_server_id    tv_address_hidden    fake_server_region_id    is_paused    creator_id    dev_build    anticheat_enabled    type    best_of    cancellation_reason    password    chat_id    server_region_id    game_id    game_mode_id    max_rounds_count    map_banpick_config_id    maps(order_by: {number: asc}) {      id      number      game_status      started_at      finished_at      demo_url      demo_deleted      map_id      __typename    }    teams(order_by: {id: asc}) {      id      captain_id      name      score      size      chat_id      is_winner      initial_side      mapStats {        match_team_id        match_map_id        score        is_winner        initial_side        __typename      }      __typename    }    serverInstance {      id      ip      port      tv_port      __typename    }    members {      ...match_member      __typename    }    __typename  }}";
const variables = {
    gameID: 2,
    id: null
}
const variables2 = {
    matchID: null
}
const operationName2 = 'GetMatchMemberMapStats';
const query2 = "query GetMatchMemberMapStats($matchID: Int!) {  match_member_map_stats(where: {match_id: {_eq: $matchID}}) {    match_id    user_id    match_team_id    match_map_id    kills    deaths    assists    headshots    damage_avg    first_kills_tt    first_kills_ct    first_deaths_tt    first_deaths_ct    clutch_1v5    clutch_1v4    clutch_1v3    clutch_1v2    clutch_1v1    multikill_5k    multikill_4k    multikill_3k    multikill_2k    multikill_1k    airshots    oneshots    noscopes    wallbangs    __typename  }}";
const players = {};
const format = {
    kills: 0,
    deaths: 0,
    assists: 0,
    damage_avg: 0,
    headshots: 0,
    wallbangs: 0,
    fd: 0,
    fk: 0,
    oneshots: 0
}
const ids = [3689645, 3689723, 3689388, 3689321, 3688819, 3688707, 3688090, 3687984, 3687032, 3686961, 3686238, 3686165];
const operationName = "GetMatch";

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

const allPlayers = async (lanNumber, UserID, aggregate) => {
    const where = {};
    const whereUserDetails = {};
    if (lanNumber) whereUserDetails.lanNumber = lanNumber;
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
            },format);
            data['k/d'] = data.kills / data.deaths;
            data.damage_avg = data.damage_avg / user.user_details.length;
            prev[user.nickName] = data;
            return prev;
        },{});
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
        res.status(200).json('done');
    });

    app.post('/players', async (req, res) => {
        const { lanNumber, players, aggregate } = req.query;
        const data = await allPlayers(lanNumber, players, aggregate);
        res.status(200).json(data);
    })

    app.listen(PORT, () => console.log(`Listening on ${ PORT }`));
})();