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

//ROUTE FOR GETTING ALL PRODUCTS
router.post('/get', function (req, res) {
    productGet(req, function (body) {
        if (body.status == 0) {
            oops(res, body.msg);
        } else {
            success(res,body);
            // success(res, 1, body.msg, body.response);
        }
    });
});

//ROUTE FOR GET PRODUCT REVIEW
router.post('/review', function (req, res) {
    productReview(req, function (body) {
        if (body.status == 0) {
            oops(res, body.msg);
        } else {
            success(res,body);
            // success(res, 1, body.msg, body.response);
        }
    });
});

//ROUTE FOR GET PRODUCT RATING
router.post('/getrating', function (req, res) {
    productGetRating(req, function (body) {
        if (body.status == 0) {
            oops(res, body.msg);
        } else {
            success(res,body);
            // success(res, 1, body.msg, body.response);
        }
    });
});

//ROUTE FOR REVIEW SUBMIT OF ANY PRODUCT
router.post('/submitreview', function (req, res) {
    validate(req, {
        sku: 'required',
        store_id: 'required',
        title: 'required',
        details: 'required',
        nickname: 'required',
        rating_options: 'required',
        secret: 'optional'
    }, null, function (body) {
        if (req.headers.app_id && req.URL) {
            API(req, body, '/product/submitreview/', function (status, response, msg) {
                if (status == 0) {
                    oops(res, msg);
                } else {
                    success(res, response);
                }
            });
        } else {
            oops(res, INVALID);
        }
    });
});

//ROUTE FOR NOTIFY A PRODUCT WHEN IT AVAILABLE
router.post('/productNotification', function (req, res) {
    validate(req, {
        sku: 'required',
        email: 'optional'
    }, null, function (body) {
        API(req, body, '/product/productNotification/', function (status, response, msg) {
            if (status == 0) {
                oops(res, msg);
            } else {
                success(res, response);
            }
        });
    });
});

module.exports = router;