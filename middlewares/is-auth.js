module.exports = (req, res, next) => {
    if(!req.session.user) {
        return res.redirect('/auth/login');
    }
    next();
}