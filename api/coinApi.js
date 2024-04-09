const io = require('../socket')

const coinApi = async () => {
    // TODO Fetch coins from database to know which to query

    const endPoints = ['0xa7480aafa8ad2af3ce24ac6853f960ae6ac7f0c4', '0x35ca6a41252f7e0bccdc1d7b2d5b6e2e35a7b483', '0xef64da9c4840b2c88b2f73b79db3c4e51e27f53a', '0xdfee6698831ff2ec5d7f5080a4c9ae44e4e86494']
    const pairAddresses = endPoints.join(',')
    try {
        const response = await fetch('https://api.dexscreener.com/latest/dex/pairs/ethereum/' + pairAddresses)
        let coinData = await response.json()

        // updatedCoinData is an array of objects
        let updatedCoinData = coinData.pairs.map(item => (
            {
                name: item.baseToken.name,
                price: '$' + item.priceUsd
            }
        ));

        console.log(updatedCoinData)

        // Update frontend on each poll
        console.log('emitted')
        io.getIO().emit('coinDataUpdated', updatedCoinData);
    }
    catch (error) {
        throw new Error(error)
    }
}

module.exports = { coinApi } 