var express = require('express');
var router = express.Router();
require('../mods/schema');
var mongoose = require('mongoose');
var conn = mongoose.connection;
var Grid = require('gridfs-stream');
Grid.mongo = mongoose.mongo;
var moment = require('moment');
var staticsticAPIDB = conn.model('staticsticAPI', staticsticAPI);

router.post('/statistics_status', function (req, res) {
    var APP_ID ='com.tethr';
    if (APP_ID) {
        staticsticAPIDB.find({APP_ID: APP_ID}, function (err, dbrecord) {
            if (err) {
                res.json({status: 0, message: err});
            } else if (!dbrecord || dbrecord.length == '0') {
                res.json({status: 0, msg: "not found"});
            } else {
                res.json({status: 1, msg: dbrecord});            }
        });
    } else {
        res.json({status: 0, msg: "Invalid Fields"});
    }
});

module.exports = router;