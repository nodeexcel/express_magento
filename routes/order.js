require('node-import');
require('../service/validate');
require('../service/request');
require('../service/responseMsg');
imports('config/index');
imports('config/constant');
var express = require('express');
var router = express.Router();

router.post('/alllist', isAuth, function (req, res) {
    validate(req, {secret: 'required'}, req.body.secret, function (body) {
        API(req, body, '/order/alllist/', function (status, response, msg) {
            if (status == 0) {
                oops(res, msg);
            } else {
                success(res, status, response);
            }
        });
    });
});

router.post('/totalorder', isAuth, function (req, res) {
    validate(req, {secret: 'required'}, req.body.secret, function (body) {
        API(req, body, '/order/totalorder/', function (status, response, msg) {
            if (status == 0) {
                oops(res, msg);
            } else {
                success(res, status, response);
            }
        });
    });
});

router.post('/get', isAuth, function (req, res) {
    validate(req, {order_id: 'required',
        secret: 'required'}, req.body.secret, function (body) {
        API(req, body, '/order/get', function (status, response, msg) {
            if (status == 0) {
                oops(res, msg);
            } else {
                success(res, status, response);
            }
        });
    });
});

module.exports = router;