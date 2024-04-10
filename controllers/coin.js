const Coin = require('../models/coin')
// const endPoints = ['0xa7480aafa8ad2af3ce24ac6853f960ae6ac7f0c4', '0x35ca6a41252f7e0bccdc1d7b2d5b6e2e35a7b483', '0xef64da9c4840b2c88b2f73b79db3c4e51e27f53a', '0xdfee6698831ff2ec5d7f5080a4c9ae44e4e86494']

exports.getIndex = async (req, res) => {

    try {
        // Fetch our tokens from the DB
        const allCoins = await Coin.findAll({
            attributes: ['token']
        })
        const endPoints = allCoins.map(coin => {
            return coin.token
        })
        // Join token for the API
        const pairAddresses = endPoints.join(',')

        // Do an initial fetch to get price
        const response = await fetch('https://api.dexscreener.com/latest/dex/pairs/ethereum/' + pairAddresses)
        coinData = await response.json()

        res.render('coins/index', {
            pageTitle: 'Coins',
            coinData: coinData.pairs
        })
    }
    catch (error) {
        throw new Error(error)
    }

}

exports.postCoin = async (req, res) => {
    const tokenAddress = req.body.tokenAddress
    try {
        const response = await fetch('https://api.dexscreener.com/latest/dex/pairs/ethereum/' + tokenAddress)
        const coinData = await response.json()
        const name = coinData.pairs[0].baseToken.name
        const token = coinData.pairs[0].baseToken.address

        await Coin.create({
            name,
            token
        })

        res.redirect('/')
    }
    catch (err) {
        throw new Error(err)
    }
}