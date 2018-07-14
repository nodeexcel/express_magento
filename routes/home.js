require('node-import');
require('../service/home');
imports('config/index');
imports('config/constant');
var express = require('express');
var router = express.Router();

router.post('/products', function (req, res) {
    homeProducts(req, function (body) {
        if (body.status == 0) {
            oops(res, body.msg);
        } else {
            success(res, 1, body.msg);
        }
    });
});

router.post('/categories', function (req, res) {
    homeCategories(req, function (body) {
        if (body.status == 0) {
            oops(res, body.msg);
        } else {
            success(res, 1, body.msg);
        }
    });
});

router.post('/slider', function (req, res) {
    homeSlider(req, function (body) {
        if (body.status == 0) {
            oops(res, body.msg);
        } else {
            success(res, 1, body.msg);
        }
    });
});

module.exports = router;