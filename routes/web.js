require('node-import');
require('../service/validate');
require('../service/request');
require('../service/responseMsg');
imports('config/index');
imports('config/constant');
var express = require('express');
var router = express.Router();

router.post('/config', function (req, res) {
    validate(req, {secret: 'optional'}, null, function (body) {
        API(req, body, '/excellence/mobile/api/v1/web/config', 'post', function (status, response, msg) {
            if (status == 0) {
                oops(res, msg);
            } else {
                success(res, status, response);
            }
        });
    });
});

router.post('/getAllowedCountries', function (req, res) {
    validate(req, {store_id: 1,
        secret: 'optional'}, null, function (body) {
        API(req, null, '/rest/V1/directory/countries', 'GET', function (status, response, msg) {
            if (status == 0) {
                oops(res, msg);
            } else {
                success(res, status, response);
            }
        });
    });
});

module.exports = router;