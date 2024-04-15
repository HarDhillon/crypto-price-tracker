const { fetchCoinsFromDatabase, returnCoins } = require('../api/coinApi')
const Coin = require('../models/coin')
const UserCoin = require('../models/user-coin')

exports.getIndex = async (req, res, next) => {
    try {
        // Get our coins from the coins variable
        const coins = returnCoins()

        let coinData

        let message = req.flash('error')
        if (message.length > 0) {
            message = message[0]
        } else {
            message = null
        }

        if (coins.length > 0) {
            const endPoints = coins.map(coin => {
                return coin.token
            })
            // Join token for the API
            const pairAddresses = endPoints.join(',')

            // Do an initial fetch of our coins
            const response = await fetch('https://api.dexscreener.com/latest/dex/pairs/ethereum/' + pairAddresses)
            apiQuery = await response.json()

            // TODO store user coins in a variable when they login to only query once
            user = req.user
            const userCoins = await user.getCoins()

            // For each coin fetched
            coinData = apiQuery.pairs.map(coin => {
                let buyPrice = null
                let coinId = null
                // If user holds that coin, set buy price
                userCoins.forEach(item => {
                    if (item.token === coin.pairAddress) {
                        buyPrice = item.userCoin.buyPrice
                        coinId = item.id
                    }
                })

                return {
                    coinName: coin.baseToken.name,
                    coinPrice: coin.priceUsd,
                    coinToken: coin.pairAddress,
                    buyPrice,
                    id: coinId,
                }
            })
        }

        res.render('coins/index', {
            pageTitle: 'Retirement Fund',
            coinData: coinData,
            userBuyPrice: '',
            message
        })
    }
    catch (error) {
        next(error)
    }
}

exports.postCoin = async (req, res, next) => {
    const tokenAddress = req.body.tokenAddress
    console.log(tokenAddress)
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
        await fetchCoinsFromDatabase()

        res.redirect('/')
    }
    catch (err) {
        req.flash('error', 'Something went wrong with adding the coin. Try using the token address at the end of the dex screener url')
        res.redirect('/')
    }
}

exports.postBuyCoin = async (req, res, next) => {

    const { buyPrice, coinToken } = req.body

    try {
        const coin = await Coin.findOne({ where: { token: coinToken } })
        const user = req.user

        await user.addCoin(coin, { through: { buyPrice } })

        res.status(200).redirect('/')

    } catch (err) {
        next(error)
    }
}

exports.deleteBuyPrice = async (req, res, next) => {
    const { coinId } = req.body
    userId = req.user.id

    try {
        await UserCoin.destroy({
            where: {
                userId: userId,
                coinId: coinId
            }
        })

        res.redirect('/')
    } catch (err) {
        next(error)
    }
}