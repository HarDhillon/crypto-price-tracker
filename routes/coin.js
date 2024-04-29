const express = require('express')
const router = express.Router()
const ensureAuthenticated = require('../util/ensureAuthenticated')
const coinController = require('../controllers/coin')


router.get('/', ensureAuthenticated, coinController.getIndex)

router.post('/add-coin', ensureAuthenticated, coinController.postCoin)

router.post('/buy-coin', ensureAuthenticated, coinController.postBuyCoin)

// TODO user router.delete when  we create front end OR use JS to post the form with DELETE
router.post('/remove-buy', ensureAuthenticated, coinController.deleteBuyPrice)

router.post('/remove-coin-track', ensureAuthenticated, coinController.deleteCoinTrack)

module.exports = router