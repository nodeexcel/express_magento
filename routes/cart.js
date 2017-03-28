require('node-import');
require('../service/auth');
require('../service/validate');
require('../service/request');
require('../service/responseMsg');
imports('config/index');
imports('config/constant');
var express = require('express');
var router = express.Router();
{"productid":"888","qty":1,"store_id":"1","super_attribute":{"542":"1","879":"1","881":"2"}}
data for configurable product 
{"productid":"893","qty":1,"store_id":"1","options":{"41":["51"],"42":{"month":1,"day":1,"year":2017}},"super_attribute":{"92":"24","180":"81","226":"232"}}
data for bundle product
{"productid":"445","qty":1,"store_id":"1","bundle_option":{"20":"83","19":"80","18":"79","17":"77"},"bundle_option_qty":{"20":"1","19":"2","18":"3","17":"5"}}
data for downloadable product
{"productid":"560","qty":1,"store_id":"1","links":{"0":"15","1":"23"}}
data for virtual product
{"productid":"441","qty":1,"store_id":"1"}
data for simple product
{"productid":"899","qty":1,"store_id":"1","options":{"46":"58","45":{"month":2,"day":15,"year":2017},"47":["60"],"44":"56","48":"63","49":"65","50":"dsfasfasdfa","51":"test"}}
//compulsory
productid
qty
store_id
//optional
super_attribute
options
bundle_option
bundle_option_qty
links

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