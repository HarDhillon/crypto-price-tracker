const express = require('express')
const router = express.Router()
const ensureAuthenticated = require('../util/ensureAuthenticated')
const coinController = require('../controllers/coin')


router.get('/', ensureAuthenticated, coinController.getIndex)

router.post('/add-coin', coinController.postCoin)

module.exports = router