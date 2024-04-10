const Sequelize = require('sequelize')
const sequelize = require('../util/database')

const Coin = sequelize.define('coin', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    token: {
        type: Sequelize.STRING,
        allowNull: false
    }
})

module.exports = Coin