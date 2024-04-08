exports.getIndex = (req, res, next) => {
    res.render('coins/index', {
        prageTitle: 'Coins'
    })
}