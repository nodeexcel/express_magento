require('node-import');
require('../service/validate');
require('../service/image');
require('../service/request');
require('../service/cache');
require('../service/responseMsg');
require('../service/category');
imports('config/index');
imports('config/constant');
var express = require('express');
var router = express.Router();

//ROUTE FOR GETTING CATEGORY PRODUCTS
router.all('/products', function (req, res) {
    categoryProducts(req, function (body) {
        if (body.status == 0) {
            oops(res, body.msg);
        } else {
            success(res, body.msg);
            // success(res, 1, body.msg, body.response);
        }
    });
});

//ROUTE FOR GETTING CATEGORY LIST
router.all('/categorylist', function (req, res) {
    categoryList(req, function (body) {
        if (body.status == 0) {
            oops(res, body.msg);
        } else {
            success(res, body.msg);
            // success(res, 1, body.msg, body.response);
        }
    });
});

module.exports = router;