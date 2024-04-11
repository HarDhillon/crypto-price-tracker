const ensureAuthenticated = (req, res, next) => {
    // isAuthenticated is provided by passport
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
};

module.exports = ensureAuthenticated;
