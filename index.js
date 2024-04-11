// ============== Start Require ==================
const express = require('express')
const app = express()
const port = 3000
const path = require('path')

const sequelize = require('./util/database')
const Coin = require('./models/coin')
const User = require('./models/user')
const UserCoin = require('./models/user-coin')

const { coinApi, fetchCoinsFromDB } = require('./api/coinApi');


const coinRoutes = require('./routes/coin')
const errorController = require('./controllers/error')


// ============== End Require ==================

// View Engine
app.set('view engine', 'ejs');

// bodyParser is now part of express so we can actually just do this
app.use(express.urlencoded({ extended: false }))

// Static files
app.use(express.static(path.join(__dirname, 'public')))

app.use(coinRoutes)

// Any other routes not matching
app.get('/500', errorController.get500)
app.use(errorController.get404)

// Error handling Middleware
app.use((error, req, res, next) => {
    console.log(error)
    res.redirect('/500')
})

// Initially get coins from Databse
fetchCoinsFromDB()

// Call coinApi every 2 second
setInterval(async () => {
    try {
        await coinApi();
    } catch (error) {
        console.error('Error fetching coin data:', error);
    }
}, 2000);

User.hasMany(Coin)
Coin.belongsToMany(User, { through: UserCoin })

// ! Dev only
sequelize.sync()
// sequelize.sync({ force: true })

const server = app.listen(port)

const io = require('./socket').init(server)

io.on('connection', socket => {
    console.log('Client connected')
})
