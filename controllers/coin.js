const { updateEndpoints, returnCoins } = require('../api/coinApi')
const Coin = require('../models/coin')
const User = require('../models/user')
// const endPoints = ['0xa7480aafa8ad2af3ce24ac6853f960ae6ac7f0c4', '0x35ca6a41252f7e0bccdc1d7b2d5b6e2e35a7b483', '0xef64da9c4840b2c88b2f73b79db3c4e51e27f53a', '0xdfee6698831ff2ec5d7f5080a4c9ae44e4e86494']

exports.getIndex = async (req, res) => {
    try {
        // Get our coins from the coins variable
        const coins = returnCoins()

        const endPoints = coins.map(coin => {
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
        const token = coinData.pairs[0].pairAddress

        await Coin.create({
            name,
            token
        })

        // Once new coin is creted, we need to repopulate the variable being called in our coinApi
        await updateEndpoints()

        res.redirect('/')
    }
    catch (err) {
        throw new Error(err)
    }
}

exports.postBuyCoin = async (req, res) => {

    const { buyPrice, coinToken } = req.body

    try {
        const coin = await Coin.findOne({ where: { token: coinToken } })
        const user = req.user

        await user.addCoin(coin, { through: { buyPrice } })

        res.status(200).redirect('/')

    } catch (err) {
        throw new Error(err)
    }
}