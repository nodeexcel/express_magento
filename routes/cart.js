require('node-import');
require('../service/auth');
require('../service/validate');
require('../service/request');
require('../service/responseMsg');
imports('config/index');
imports('config/constant');
var express = require('express');
var router = express.Router();

//ROUTE FOR CART
router.all('/cart', isAuth, function (req, res) {
    validate(req, {
        secret: 'required',
        productid: 'required',
        store_id: 'required',
        qty:'required',
        options:'required',
        super_attribute:'required',
        bundle_option:'required',
        bundle_option_qty:'required',
        links:'required'}, req.body.secret, function (error, body) {
        API(req, body, '/cart/cart/', function (status, response, msg) {
            if (status == 0) {
                oops(res, msg);
            } else {
                success(res, response);
                // success(res, status, response);
            }
        });
    });
});

router.all('/getShippingMethods', isAuth, function (req, res) {
    validate(req, {countryid: 'optional',
        secret: 'required'}, req.body.secret, function (error, body) {
        API(req, body, '/cart/getShippingMethods/', function (status, response, msg) {
            if (status == 0) {
                oops(res, msg);
            } else {
                success(res, response);
                // success(res, status, response);
            }
        });
    });
});

router.all('/getPaymentMethods', isAuth, function (req, res) {
    validate(req, {countryid: 'optional',
        secret: 'required'}, req.body.secret, function (error, body) {
        API(req, body, '/cart/getPaymentMethods/', function (status, response, msg) {
            if (status == 0) {
                oops(res, msg);
            } else {
                success(res, response);
                // success(res, status, response);
            }
        });
    });
});

module.exports = router;