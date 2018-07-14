var express = require('express');
var path = require('path');
require('node-import');
<<<<<<< HEAD
var favicon = require('serve-favicon');
=======
var favicon = require('static-favicon');
>>>>>>> cb1a537d14da937ee030fac16c499c0cc245f271
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var verify = require('./middleware/verify.js');
var redis = require('./middleware/redis.js');
var optimus = require('connect-image-optimus');
var connect = require('connect');
<<<<<<< HEAD
var http  = require('http');
=======


>>>>>>> cb1a537d14da937ee030fac16c499c0cc245f271
var db = require('./mods/db.js');
var app = express();

var optimus = require('connect-image-optimus');
var connect = require('connect');
var serveStatic = require('serve-static');

var staticPath = __dirname + '/static/';

app.use(optimus(staticPath));
// app.use(connect.static(staticPath));
app.use(serveStatic(staticPath));
//var app = connect();

var cors = require('cors');
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

<<<<<<< HEAD
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
=======
app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
>>>>>>> cb1a537d14da937ee030fac16c499c0cc245f271
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public ')));
app.use(cors());
app.use(db());
app.use(verify);
<<<<<<< HEAD
// app.use(redis);
=======
app.use(redis);
>>>>>>> cb1a537d14da937ee030fac16c499c0cc245f271

var routes = require('./routes/index');
var category = require('./routes/category');
var customer = require('./routes/customer');
var product = require('./routes/product');
var home = require('./routes/home');
var account = require('./routes/account');
var order = require('./routes/order');
var address = require('./routes/address');
var cart = require('./routes/cart');
var redis = require('./routes/redis');
var web = require('./routes/web');

app.use('/', routes);
app.use('/category', category);
app.use('/customer', customer);
app.use('/product', product);
app.use('/home', home);
app.use('/account', account);
app.use('/order', order);
app.use('/address', address);
app.use('/cart', cart);
app.use('/redis', redis);
app.use('/web', web);

app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
<<<<<<< HEAD
        res.send('error', {
=======
        res.render('error', {
>>>>>>> cb1a537d14da937ee030fac16c499c0cc245f271
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    console.log(err)
    res.status(err.status || 500);
<<<<<<< HEAD
    res.send('error', {
=======
    res.render('error', {
>>>>>>> cb1a537d14da937ee030fac16c499c0cc245f271
        message: err.message,
        error: {}
    });
});

<<<<<<< HEAD

=======
>>>>>>> cb1a537d14da937ee030fac16c499c0cc245f271
module.exports = app;