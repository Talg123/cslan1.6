const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000
const { sequelize } = require('./db.js');
const { allPlayers, receiveData } = require('./controller.js');

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