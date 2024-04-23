const { fetchCoinsFromDatabase, returnCoins } = require('../api/coinApi')
const Coin = require('../models/coin')
const UserCoin = require('../models/user-coin')

exports.getIndex = async (req, res, next) => {
    try {
        // Get our coins from the coins variable
        const coins = returnCoins()

        // Show flash errors if exist
        let message = req.flash('error')
        if (message.length > 0) {
            message = message[0]
        } else {
            message = null
        }

        let userCoinData = []
        let otherTrackedCoins = []

        // If there are coins being tracked
        if (coins.length > 0) {
            const endPoints = coins.map(coin => {
                return coin.token
            })
            // Join token for the API
            const pairAddresses = endPoints.join(',')

            // Do an initial fetch of our coins
            const response = await fetch('https://api.dexscreener.com/latest/dex/pairs/ethereum/' + pairAddresses)
            apiQuery = await response.json()

            // TODO store user coins in a cache when they login to only query once
            user = req.user
            const userCoins = await user.getCoins()

            // For each coin fetched
            apiQuery.pairs.forEach(coin => {
                // Check if user holds that coin
                const userCoin = userCoins.find(userCoin => userCoin.token === coin.pairAddress)

                // Store coinId associated with that coin
                const coinId = coins.find(coinDb => coinDb.token === coin.pairAddress)?.id || null;

                // If user holds that coin add to our userCoin
                if (userCoin) {
                    userCoinData.push(
                        {
                            coinName: coin.baseToken.name,
                            coinPrice: coin.priceUsd,
                            coinId,
                            coinToken: coin.pairAddress,
                            userCoinId: userCoin.userCoin.id,
                            buyPrice: userCoin.userCoin.buyPrice || null,
                        }
                    )
                }
                // Otherwise show as other coins
                else {
                    otherTrackedCoins.push(
                        {
                            coinName: coin.baseToken.name,
                            coinPrice: coin.priceUsd,
                            coinToken: coin.pairAddress,
                            coinId
                        }
                    )
                }
            })
        }

        res.render('coins/index', {
            pageTitle: 'Retirement Fund',
            coinData: userCoinData,
            otherTrackedCoins,
            message
        })
    }
    catch (err) {
        next(err)
    }
}

exports.postCoin = async (req, res, next) => {
    const { tokenAddress, coinId } = req.body
    const user = req.user

    try {
        if (tokenAddress) {
            const response = await fetch('https://api.dexscreener.com/latest/dex/pairs/ethereum/' + tokenAddress)
            const coinData = await response.json()

            const name = coinData.pairs[0].baseToken.name
            const token = coinData.pairs[0].pairAddress

            const newCoin = await Coin.create({
                name,
                token
            })

            await user.addCoin(newCoin)

            // Once new coin is creted, we need to repopulate the variable being called in our coinApi
            await fetchCoinsFromDatabase()

        } else if (coinId) {
            const coin = await Coin.findOne({ where: { id: coinId } })
            await user.addCoin(coin)
        }

        res.redirect('/')
    }
    catch (err) {
        console.log(err)
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
        next(err)
    }
}

exports.deleteBuyPrice = async (req, res, next) => {
    const { coinId } = req.body
    userId = req.user.id

    try {
        await UserCoin.update({ buyPrice: null }, {
            where: { userId: userId, coinId: coinId }
        })

        res.redirect('/')
    } catch (err) {
        next(err)
    }
}

exports.deleteCoinTrack = async (req, res, next) => {
    try {
        const { userCoinId, coinId } = req.body

        await UserCoin.destroy({ where: { id: userCoinId } })

        // Check if recently deleted coin is being tracked by any user
        const coinTracked = await UserCoin.findOne({ where: { coinId: coinId } })

        // If no user is tracking the coin anymore, remove the coin
        if (!coinTracked) {
            await Coin.destroy({ where: { id: coinId } })
        }

        // Re-fetch our coins to store in cache
        fetchCoinsFromDatabase()


        res.redirect('/')

    } catch (err) {
        next(err)
    }


}