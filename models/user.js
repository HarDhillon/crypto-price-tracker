const Sequelize = require('sequelize')
const sequelize = require('../util/database')
const bcrypt = require('bcryptjs');

const User = sequelize.define('user', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    username: {
        type: Sequelize.STRING,
        allowNull: false
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false
    }
})

User.prototype.validatePassword = async function (password) {
    return bcrypt.compare(password, this.password);
};

module.exports = User