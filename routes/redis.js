require('../service/responseMsg');
var express = require('express');
var router = express.Router();
var redis = require("redis"),
        client = redis.createClient();

router.post('/flush', function (req, res) {
    var HeaderId_ = req.HeaderId;
    client.select(HeaderId_, function (err, res) {
        client.set('key', 'string');
    });
    client.flushdb(function (err, succeeded) {
        if (err) {
            oops(res, err);
        } else {
            success(res, succeeded);
        }
    });
});

router.post('/set_status', function (req, res) {
    var dtabase = req.app;
    var APP_ID = req.headers.app_id;
    var status = req.body.status;
    dtabase.find({APP_ID: APP_ID}, function (err, result) {
        if (err) {
            oops(res, err);
        } else if (status == 'enabled' || status == 'disabled') {
            dtabase.update({APP_ID: APP_ID}, {
                status: status,
            }, function (error) {
                if (error) {
                    oops(res, error);
                } else {
                    success(res, 'the status is successfully changed to ' + status);
                }
            });
        } else {
            success(res, "the status is not changed successfully,  you have to set status enabled or disabled");
        }
    });
});

router.post('/check_status', function (req, res) {
    var dtabase = req.app;
    var APP_ID = req.headers.app_id;
    dtabase.find({APP_ID: APP_ID}, function (err, result) {
        if (err) {
            oops(res, err);
        } else {
            success(res, result[0].status);
        }
    });
});

module.exports = router;