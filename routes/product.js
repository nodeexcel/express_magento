require('node-import');
require('../service/validate');
require('../service/image');
require('../service/request');
require('../service/cache');
require('../service/responseMsg');
require('../service/product');
imports('config/index');
imports('config/constant');
var express = require('express');
var router = express.Router();

router.post('/get', function (req, res) {
    productGet(req, function (body) {
        if (body.status == 0) {
            oops(res, body.msg);
        } else {
            success(res, 1, body.msg);
        }
    });
});

router.post('/review', function (req, res) {
    productReview(req, function (body) {
        if (body.status == 0) {
            oops(res, body.msg);
        } else {
            success(res, 1, body.msg);
        }
    });
});

router.post('/getrating', function (req, res) {
    productGetRating(req, function (body) {
        if (body.status == 0) {
            oops(res, body.msg);
        } else {
            success(res, 1, body.msg);
        }
    });
});

router.post('/submitreview', function (req, res) {
    validate(req, {sku: 'required',
        store_id: 'required',
        title: 'required',
        details: 'required',
        nickname: 'required',
        rating_options: 'required',
        secret: 'optional'}, null, function (body) {
        if (req.headers.app_id && req.URL) {
            API(req, body, '/product/submitreview/', function (status, response, msg) {
                if (status == 0) {
                    oops(res, msg);
                } else {
                    success(res, status, response);
                }
            });
        } else {
            oops(res, INVALID);
        }
    });
});

router.post('/productNotification', function (req, res) {
    validate(req, res, {sku: 'required',
        email: 'required'}, null, function (body) {
        if (req.headers.app_id && req.URL) {
            API(req, res, body, '/product/productNotification/', function (status, response, msg) {
                success(res, status, response);
            });
        } else {
            success(res, 0, INVALID);
        }
    });
});

module.exports = router;