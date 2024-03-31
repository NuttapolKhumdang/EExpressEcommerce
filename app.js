require('./modules/Database');

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const consolidate = require('consolidate');

const app = express();

app.engine('html', consolidate.swig);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'static')));

const apiRouter = require('./routes/api');
const indexRouter = require('./routes/index');
const productRouter = require('./routes/product');
const managersRouter = require('./routes/managers');

app.use('/api', apiRouter);
app.use('/managers', managersRouter);
app.use('/product', productRouter);
app.use('/', indexRouter);

module.exports = app;

