const express = require('express');
const axios = require('axios').default;
const PORT = process.env.PORT || 5000
const url = `https://hasura.fastcup.net/v1/graphql`;

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
    nickname: 0,
    kills: 0,
    deaths: 0,
    assists: 0,
    'avg dmg': 0,
    headshots: 0,
    wallbangs: 0,
    '1v3': 0,
    '1v4': 0,
    'fd': 0,
    'fk': 0,
    oneshots: 0,
    games: 0
}

const ids = [3689645, 3689723, 3689388, 3689321, 3688819, 3688707, 3688090, 3687984, 3687032, 3686961, 3686238, 3686165];
const operationName = "GetMatch";
const receiveData = async () => {
    for (const id of ids) {
        variables.id = id;
        variables2.matchID = id;
        const { data } = await axios.post(url, {query, variables, operationName});
        const { data: data2 } = await axios.post(url, {query: query2, variables: variables2, operationName: operationName2});
        const members = data.data.match.members;
        const members2 = data2.data.match_member_map_stats;
        for (const member of members) {
            const member2 = members2.find(user => member.private.user.id === user.user_id);
            if (!players[member.private.user.id]) {
                players[member.private.user.id] = {...format, nickname: member.private.user.nickName};
            }
            players[member.private.user.id].kills+=member.kills;
            players[member.private.user.id].deaths+=member.deaths;
            players[member.private.user.id].assists+=member.assists;
            players[member.private.user.id]['avg dmg']+=member2.damage_avg;
            players[member.private.user.id].headshots+=member2.headshots;
            players[member.private.user.id].oneshots+=member2.oneshots;
            players[member.private.user.id].wallbangs+=member2.wallbangs;
            players[member.private.user.id]['1v3']+=member2.clutch_1v3;
            players[member.private.user.id]['1v4']+=member2.clutch_1v4;
            players[member.private.user.id]['fd']+=member2.first_deaths_ct + member2.first_deaths_tt;
            players[member.private.user.id]['fk']+=member2.first_kills_ct + member2.first_kills_tt;
            players[member.private.user.id].games+=1;
            
        }
    }
    const sortable = Object.entries(players)
    .sort(([,a],[,b]) => b.kills-a.kills).map(([k,v]) => ({...v, 'k/d': v.kills/v.deaths, 'avg dmg': v['avg dmg']/v.games}));
    return sortable;
}

express().get('/', async (req, res) => {
    const response = await receiveData();
    res.status(200).json(response);
}).listen(PORT, () => console.log(`Listening on ${ PORT }`));