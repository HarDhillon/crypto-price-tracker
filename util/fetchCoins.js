const Coin = require('../models/coin')

const fetchCoins = async (req, res, next) => {
    try {
        const allCoins = await Coin.findAll();
        req.coins = allCoins

    } catch (error) {
        throw new Error(error);
    }
}

module.exports = fetchCoins