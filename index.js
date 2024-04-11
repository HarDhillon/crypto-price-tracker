// ============== Start Require ==================
require('dotenv').config();

const express = require('express')
const app = express()
const port = 3000
const path = require('path')

const passport = require('passport')
const LocalStrategy = require("passport-local").Strategy;
const session = require('express-session')

const sequelize = require('./util/database')
const Coin = require('./models/coin')
const User = require('./models/user')
const UserCoin = require('./models/user-coin')

const { coinApi, fetchCoinsFromDB } = require('./api/coinApi');


const coinRoutes = require('./routes/coin')
const authRoutes = require('./routes/auth')
const errorController = require('./controllers/error')


// ============== End Require ==================

// View Engine
app.set('view engine', 'ejs');

// bodyParser is now part of express so we can actually just do this
app.use(express.urlencoded({ extended: false }))

// Static files
app.use(express.static(path.join(__dirname, 'public')))


// TODO Move passport into its own util file

// =============== Passport Start ==================
passport.use(new LocalStrategy(
    async (username, password, done) => {
        try {
            const user = await User.findOne({ where: { username } });

            if (!user) {
                return done(null, false, { message: 'Incorrect username.' });
            }

            const isValidPassword = await user.validatePassword(password);

            if (!isValidPassword) {
                return done(null, false, { message: 'Incorrect password.' });
            }

            return done(null, user);
        } catch (error) {
            return done(error);
        }
    }
));

// serializeUser stores the user id in the session
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// deserialize user retrieves the whole user from the id stored in the session
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findByPk(id);
        done(null, user);
    } catch (error) {
        done(error);
    }
});



// =============== Passport End ==================

// Sessions
app.use(session({
    secret: process.env.SESSION_SECRET
}));
// * To correctly serialize and deserialize our user so they are stored in req.session. We need to initialize passport AFTER our session middleware
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use(authRoutes)
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
User.belongsToMany(Coin, { through: UserCoin })
Coin.belongsToMany(User, { through: UserCoin })

// ! Dev only
sequelize.sync()
// sequelize.sync({ force: true })

const server = app.listen(port)

const io = require('./socket').init(server)

io.on('connection', socket => {
    console.log('Client connected')
})
