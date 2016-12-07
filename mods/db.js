require('node-import');
imports('config/index');
require('../service/cron');
var mongoose = require('mongoose');
var _ = require('lodash');

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

        var categoryListSchema = new Schema({
            "cache": Number,
            "key": String,
            "name": String,
            "type": String
        });
        var CollectioncategoryList = conn.model('categoryListCache', categoryListSchema);

        var homeSchema = mongoose.Schema({
            "cache": Number,
            "URL": String,
            "type": String
        });
        var homeSlider = conn.model('homeSliderCache', homeSchema);

        var homeProductSchema = mongoose.Schema({
            cache: Number,
            key: String,
            categoryName: String,
            type: String
        });
        var homeProducts = conn.model('homeProductsCache', homeProductSchema);

        app_urls.find({}, {APP_ID: 1, _id: 0}, function (err, value) {
            if (err) {
                console.log(err);
            } else if (!value) {
                console.log(value);
            } else {
                _.forEach(value, function (row) {
                    app_id = row.get('APP_ID');
//                    processStore(app_urls, CollectioncategoryList, homeSlider, homeProducts, app_id);
                });
            }
        });
    });

    conn.on('error', function (err) {
        process.exit();
    });

    var gfs = Grid(conn.db);
    return function (req, res, next) {
        req.mongo = conn;
        req.gfs = gfs;
        req.app = app_urls;
        next();
    };

};