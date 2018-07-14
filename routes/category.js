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

router.all('/products', function (req, res) {
    categoryProducts(req, function (body) {
        if (body.status == 0) {
            oops(res, body.msg);
        } else {
            success(res, 1, body.msg);
        }
    });
});

router.all('/categorylist', function (req, res) {
    categoryList(req, function (body) {
        if (body.status == 0) {
            oops(res, body.msg);
        } else {
            success(res, 1, body.msg);
        }
    });
});

module.exports = router;