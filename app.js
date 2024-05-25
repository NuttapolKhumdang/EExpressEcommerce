require('dotenv').config();
require('./modules/Database');

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const consolidate = require('consolidate');

const bcrypt = require('bcrypt');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');

const { Account } = require('./models/Account');
const app = express();

app.engine('html', consolidate.swig);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.set('trust proxy', true);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'resource', 'favicon')));

app.use(
    session({
        secret: 'my_super_secret',
        resave: false,
        saveUninitialized: false
    })
);

passport.use(
    new LocalStrategy(async (username, password, cb) => {
        const user = await Account.findOne({ email: username });
        if (user && bcrypt.compareSync(password, user.password)) {
            return cb(null, user);
        }

        return cb(null, false);
    })
);

passport.serializeUser((user, cb) => {
    cb(null, user._id);
});

passport.deserializeUser(async (id, cb) => {
    const user = await Account.findById(id);
    cb(null, user);
});

app.use(passport.initialize());
app.use(passport.session());

const { clientAccess } = require('./modules/Analytics');
app.use(clientAccess());

if (process.env.ROUTE_TEST) app.use('/test', require('./routes/test'));

app.use('/api', require('./routes/api'));
app.use('/article', require('./routes/articles'));
app.use('/analytics', require('./routes/analytics'));
app.use('/checkout', require('./routes/checkout'));
app.use('/product', require('./routes/product'));
app.use('/managers', require('./routes/managers'));
app.use('/', require('./routes/index'));
app.use('/', require('./routes/static'));

module.exports = app;

