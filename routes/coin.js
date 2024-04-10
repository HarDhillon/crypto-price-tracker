const express = require('express')
const router = express.Router()

const coinController = require('../controllers/coin')

router.get('/', coinController.getIndex)

router.post('/add-coin', coinController.postCoin)

module.exports = router