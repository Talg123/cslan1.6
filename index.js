const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000
const { sequelize } = require('./db.js');
const { HOUR_REGEX } = require('./consts.js');
const { allPlayers, receiveData, createNewGame } = require('./controller.js');

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

    app.post('/game', async (req, res) => {
        const { time } = req.body;
        if (!time || HOUR_REGEX.test(time)) {
            return res.status(400).json({data: null, message: 'Invalid time format'});
        }
        try {
            const response = await createNewGame(time);
            res.status(200).json({data: response, message: 'Game created'});
        } catch (error) {
            res.status(500).json({data: {
                GameID: error.message
            }, message: 'Game is already active, close it first'});
        }
    });

    app.post('/game/add', async (req, res) => {
        const { playerID } = req.body;
    });

    app.listen(PORT, () => console.log(`Listening on ${ PORT }`));
})();