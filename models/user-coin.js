const Sequelize = require('sequelize')
const sequelize = require('../util/database')

const UserCoin = sequelize.define('userCoin', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    buyPrice: {
        type: Sequelize.DOUBLE,
        allowNull: false
    }
})

module.exports = UserCoin