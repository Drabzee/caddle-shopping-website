const crypto = require('crypto');
const bcrypt = require('bcrypt');
const sgMail = require('@sendgrid/mail');

const User = require('../models/user');
const Token = require('../models/token');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

module.exports.signup = (req, obj, cbSuccess, cbFailure) => {
    User.findOne({email: obj.email}).then(user => {
        if(user) {
            req.flash('error', 'Provided email already exists');
            return cbFailure();
        }
        
        return bcrypt.hash(obj.password, 12).then(hashedPwd => {
            User({
                name: obj.name,
                email: obj.email,
                password: hashedPwd,
                address: obj.address,
                cart: {
                    items: [],
                    totalPrice: 0
                }
            }).save().then(res => {
                req.flash('success', 'Account created successfully, login to continue');
                cbSuccess();
                sgMail.send({
                    to: obj.email,
                    from: 'caddle.mus@gmail.com',
                    subject: 'Welcome To Caddle',
                    html: `
                        Dear ${obj.name}, <br /><br />
                        <strong>Thank you for registering at our website www.caddle.com</strong> <br /><br />
                        We look forward to giving you the best shopping experience. E-commerce is revolutionizing the way we all shop in India. Why do you want to hop from one store to another in search of the latest phone when you can find it on the Internet in a single click? Not only mobiles. Caddle houses everything you can possibly imagine, from trending electronics to in-vogue fashion staples, from modern furniture to appliances. You name it, and you can stay assured about finding them all here.
                    `
                }).then(err => {
                    if(err) throw err;
                }).catch(err => {
                    console.log(err);
                });
            });
        });
    }).catch(err => {
        console.log(err);
    });
}

module.exports.login = (req, obj, cbSuccess, cbFailure) => {
    User.findOne({email: obj.email}).then(user => {
        if(!user) {
            req.flash('error', 'Provided email not found');
            return cbFailure();
        }

        bcrypt.compare(obj.password, user.password).then(res => {
            if(res) {
                req.session.user = user;
                return req.session.save(err => {
                    if(!err) cbSuccess();
                });
            }
            req.flash('error', 'Incorrect password entered.');
            return cbFailure();
        });
    }).catch(err => {
        console.log(err);
    });
}

module.exports.logout = (req, cb) => {
    req.flash('success', 'Logged out successfully');
    req.session.destroy(err => {
        cb();
    });
}

module.exports.sendToken = (req, email, cb) => {
    User.findOne({email: email}).then(user => {
        if(!user) {
            req.flash('error', 'Provided email does not exist');
            return cb();
        }
        let token;
        crypto.randomBytes(32, (err, buffer) => {
            token = buffer.toString('hex');
            return Token({
                token: token,
                user: user
            }).save().then(res => {
                req.flash('success', 'Check your email for further processing');
                cb();
                return sgMail.send({
                    to: user.email,
                    from: 'caddle.mus@gmail.com',
                    subject: 'Caddle : Reset Password',
                    html: `
                        Dear ${user.name}, <br /><br />
                        Need to reset your password? No problem! Just click the button below and you'll be on your way. If you did not make this request, please ignore the mail. <br /><br />
                        https://www.caddle.herokuapp.com/auth/reset-pwd/${token}<br /><br />
                        <strong>*Note : </strong>The link will expire after 1h.
                    `
                }).then(err => {
                    if(err) throw err;
                }).catch(err => {
                    console.log(err);
                });
            });
        });
    }).catch(err => {
        console.log(err);
    });
}

module.exports.getResetPwd = (req, token, cbSuccess, cbFailure) => {
    Token.findOne({token: token}).then(token => {
        if(!token) {
            req.flash('error', 'Bad Request');
            return cbFailure();
        }
        
        cbSuccess(token.token, token.user);
    }).catch(err => {
        console.log(err);
    });
}

module.exports.postResetPwd = (req, obj, cb) => {
    
    let userInstance;
    let tokenInstance;
    Token.findOne({token: obj.token}).then(token => {
        if(!token) {
            req.flash('error', 'Bad Request');
            return cb();
        }
        tokenInstance = token;
        User.findById(token.user).then(user => {
            if(!user) {
                req.flash('error', 'Bad Request');
                return cb();
            }

            userInstance = user;
            return bcrypt.hash(obj.password, 12);
        }).then(hashedPwd => {
            userInstance.password = hashedPwd;
            return userInstance.save();
        }).then(res => {
            return tokenInstance.remove();
        }).then(res => {
            req.flash('success', 'Password changed, login to continue');
            cb();
        }).catch(err => {
            console.log(err);
        });
    }).catch(err => {
        console.log(err);
    });
}