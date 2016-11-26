require('node-import');
imports('config/index');
require('../service/auth');
require('../service/validate');
imports('config/constant');
var express = require('express');
var router = express.Router();

router.post('/alllist', function (req, res) {
    isAuth(req, res, function (secret) {
        validate(req, res, {secret: 'required'}, secret, function (body) {
            API(req, res, body, '/order/alllist/', function (status, response, msg) {
                res.json({status: status, statuscode: msg, body: response});
            });
        });
    });
});

router.post('/totalorder', function (req, res) {
    isAuth(req, res, function (secret) {
        validate(req, res, {secret: 'required'}, secret, function (body) {
            API(req, res, body, '/order/totalorder/', function (status, response, msg) {
                res.json({status: status, statuscode: msg, body: response});
            });
        });
    });
});

router.post('/get', function (req, res) {
    isAuth(req, res, function (secret) {
        validate(req, res, {order_id: 'required',
            secret: 'required'}, secret, function (body) {
            API(req, body, '/order/get', function (status, response, msg) {
                res.json({status: status, statuscode: msg, body: response});
            });
        });
    });
});

module.exports = router;