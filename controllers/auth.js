const User = require('../models/user')
const bcrypt = require('bcryptjs')

const passport = require('passport');

require('dotenv').config();

exports.getSignup = async (req, res) => {
    res.render('auth/signup', {
        pageTitle: 'Signup'
    })
}

exports.postSignup = async (req, res) => {
    try {
        const { username, password, signupPassword } = req.body

        if (signupPassword === process.env.SIGNUP_PASSWORD) {
            const hashedPassword = await bcrypt.hash(password, 12)

            await User.create({
                username,
                password: hashedPassword
            })
        }

        res.redirect('/login')

    } catch (error) {
        res.redirect('/register')
        throw new Error(error)
    }
}

exports.getLogin = (req, res) => {
    res.render('auth/login', {
        pageTitle: 'Login'
    })
}

exports.postLogin = passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: false
});

exports.getLogout = (req, res) => {
    req.logout(function (err) {
        if (err) {
            // Handle error, if any
            console.error(err);
            return next(err);
        }
        // Redirect the user to the home page or any other appropriate page after logout
        res.redirect('/');
    });
};
