const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth');

router.get('/login', (req, res, next) => {
    res.render('auth/login', {successMsg: req.flash('success'), errorMsg: req.flash('error')});
});

router.post('/login', (req, res, next) => {
    authController.login(req, req.body, () => {
        res.redirect('/products');
    }, () => {
        res.redirect('/auth/login')
    });
});

router.get('/signup', (req, res, next) => {
    res.render('auth/signup', {successMsg: req.flash('success'), errorMsg: req.flash('error')});
});

router.post('/signup', (req, res, next) => {
    authController.signup(req, req.body, () => {
        res.redirect('/auth/login');
    }, () => {
        res.redirect('/auth/signup')
    });
});

router.post('/logout', (req, res, next) => {
    authController.logout(req, () => {
        res.redirect('/auth/login');
    });
});

router.get('/send-token', (req, res, next) => {
    res.render('auth/email', {successMsg: req.flash('success'), errorMsg: req.flash('error')});
});

router.post('/send-token', (req, res, next) => {
    authController.sendToken(req, req.body.email, () => {
        res.redirect('/auth/send-token');
    });
});

router.get('/reset-pwd/:token', (req, res, next) => {
    authController.getResetPwd(req, req.params.token, (token, userID) => {
        res.render('auth/reset-pwd', {token: token, userID: userID, successMsg: req.flash('success'), errorMsg: req.flash('error')});
    }, () => {
        res.redirect('/auth/login');
    });
});

router.post('/reset-pwd', (req, res, next) => {
    if(req.body.password != req.body.re_password) {
        req.flash('error', 'Password mismatch');
        return res.redirect('/auth/reset-pwd/'+req.body.token);
    }
    authController.postResetPwd(req, req.body, () => {
        res.redirect('/auth/login');
    });
});


module.exports = router;