const io = require('../socket')
const Coin = require('../models/coin')

let endPoints = [];

// Function to fetch coins from the database
const fetchCoinsFromDB = async () => {
    try {
        const allCoins = await Coin.findAll({
            attributes: ['token']
        });
        endPoints = allCoins.map(coin => coin.token);

    } catch (error) {
        throw new Error(error);
    }
};

const coinApi = async (coins) => {
    try {
        // Join token for the API
        const pairAddresses = endPoints.join(',')

        const response = await fetch('https://api.dexscreener.com/latest/dex/pairs/ethereum/' + pairAddresses)
        let coinData = await response.json()

        // updatedCoinData is an array of objects
        let updatedCoinData = coinData.pairs.map(item => (
            {
                name: item.baseToken.name,
                price: '$' + item.priceUsd
            }
        ));

        // console.log(updatedCoinData)

        // Update frontend on each poll
        console.log('emitted')
        io.getIO().emit('coinDataUpdated', updatedCoinData);
    }
    catch (error) {
        throw new Error(error)
    }
}

module.exports = { coinApi, fetchCoinsFromDB } 