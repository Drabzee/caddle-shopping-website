const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBSession = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');
const multer = require('multer');
const helmet = require('helmet');
const compression = require('compression');
// const morgan = require('morgan');
// const fs = require('fs');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');
const User = require('./models/user');
const config = require('./utils/config');

const app = express();
const sessionStore = new MongoDBSession({
    uri: config.MONGO_URI,
    collection: 'session'
});
const csrfProtection = csrf();

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '.' + file.mimetype.split('/')[1]);
    }
});

const fileFilter = (req, file, cb) => {
    if(file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg' || file.mimetype === 'image/png')
        cb(null, true);
    else cb(null, false);
}

// const accessLogStream = fs.createWriteStream(
//     path.join(__dirname, 'access.log'),
//     { flags: 'a' }
// );

app.set('view engine', 'ejs');

app.use(helmet());
app.use(compression());
// app.use(morgan('combined', {stream: accessLogStream}));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'images')));

app.use(bodyParser.urlencoded({extended: false}));
app.use(multer({storage: fileStorage, fileFilter: fileFilter}).single('image'));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
        httpOnly: true
    }
}));

app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
    if(req.session.user) {
        User.findById(req.session.user._id).then(user => {
            req.user = user;
            res.locals.isAuthenticated = true;
            next();
        }).catch(err => {
            console.log(err);
        });
    } else {
        res.locals.isAuthenticated = false;
        next();
    }
});

app.use((req, res, next) => {
    res.locals.csrfToken = req.csrfToken();
    next();
});

app.use('/admin', adminRoutes);
app.use('/auth', authRoutes);
app.use(shopRoutes);

app.use((req, res, next) => {
    res.status(404).render('404');
});

mongoose.connect(
    config.MONGO_URI, {
        useFindAndModify: false,
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true
}).then(res => {
    app.listen(process.env.PORT);
}).catch(err => {
    console.log(err);
});