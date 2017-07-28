var express = require('express');
var app = express();
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

module.exports = function (req, res, next) {
    var appId = req.headers.app_id;
    var dtabase = req.app;
    var promise = dtabase.findOne({
        APP_ID: appId
    }).exec();
    if (appId) {
        promise.then(function (verify) {
            URL = verify.get('URL');
            req.URL = URL;
            next();
        }).catch(function (err) {
            res.json({status: 0, statuscode: 500, body: "APP ID Not Found in Database!"});
        });
    } else {
        res.json({status: 0, statuscode: 500, body: "Unexpected Error!"});
    }
};