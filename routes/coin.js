const express = require('express')
const router = express.Router()

const coinController = require('../controllers/coin')

router.get('/', coinController.getIndex)


module.exports = router