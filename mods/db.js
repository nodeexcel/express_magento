require('node-import');
imports('config/index');
require('../service/cron');
var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var conn = mongoose.connection;
var Grid = require('gridfs-stream');
Grid.mongo = mongoose.mongo;


module.exports = function () {

    var app_url_schema = new Schema({
        headers: {type: String, required: true, unique: true},
        url: {type: String, required: true, unique: true},
        status: {type: String, required: true, unique: true},
        cron_running_time: {type: String, required: true, unique: true}
    });
    var app_urls = mongoose.model('AppUrls', app_url_schema);
    mongoose.connect(config.DB_URL, function (err, db) {


        var categoryListSchema = mongoose.Schema({}, {
            strict: false,
            collection: 'categoryList'
        });
        var CollectioncategoryList = conn.model('categoryList', categoryListSchema);
        var homeSchema = mongoose.Schema({}, {
            strict: false,
            collection: 'homeSlider'
        });
        var homeSlider = conn.model('homeSlider', homeSchema);
        var homeProductSchema = mongoose.Schema({}, {
            strict: false,
            collection: 'homeProducts'
        });
        var homeProducts = conn.model('homeProducts', homeProductSchema);
        app_urls.find({}, {APP_ID: 1, _id: 0}, function (err, value) {
            if (err) {
                console.log(err);
            } else if (!value) {
                console.log(value);
            } else {
                for (i = 0; i < value.length; i++) {
                    app_id = value[i].get('APP_ID');
                    cron(app_urls, CollectioncategoryList, homeSlider, homeProducts, app_id);
                }
            }
        });
    });


    conn.on('error', function (err) {
        process.exit();
    });
    // var gfs = Grid(conn.db);
    return function (req, res, next) {
        req.mongo = conn;
        // req.gfs = gfs;
        req.app = app_urls;
        next();
    };
};