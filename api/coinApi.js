const io = require('../socket')
const Coin = require('../models/coin');

// Variable to cache coins
let allCoins = [];
let cachedEndpoints = []

const fetchCoinsFromDatabase = async () => {
    try {
        // Fetch all coins from the database
        allCoins = await Coin.findAll();

        if (allCoins.length > 0) {
            // Update our endpoints so that api doesnt have to run the map every time
            cachedEndpoints = allCoins.map(coin => coin.token);
        }

    } catch (error) {
        console.error('Error updating endpoints:', error);
    }
};

const returnCoins = () => {
    return allCoins
}

const fetchCoinApi = async () => {
    try {
        if (allCoins.length > 0) {
            // Join token for the API
            const pairAddresses = cachedEndpoints.join(',')

            const response = await fetch('https://api.dexscreener.com/latest/dex/pairs/ethereum/' + pairAddresses)
            let coinData = await response.json()

            // updatedCoinData is an array of objects
            let updatedCoinData = coinData.pairs.map(item => (
                {
                    name: item.baseToken.name,
                    price: item.priceUsd
                }
            ));

            // console.log(updatedCoinData)

            // Update frontend on each poll
            io.getIO().emit('coinDataUpdated', updatedCoinData);
        }
    }
    catch (error) {
        throw new Error(error)
    }
}

module.exports = { fetchCoinApi, fetchCoinsFromDatabase, returnCoins }