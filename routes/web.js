require('node-import');
require('../service/validate');
require('../service/request');
require('../service/responseMsg');
require('../service/web');
imports('config/index');
imports('config/constant');
var express = require('express');
var router = express.Router();

router.post('/config', function (req, res) {
    webConfig(req, function (body) {
        if (body.status == 0) {
            oops(res, body.msg);
        } else {
            success(res, 1, body.msg);
        }
    });
});

router.post('/getAllowedCountries', function (req, res) {
    validate(req, {store_id: 'required',
        secret: 'optional'}, null, function (body) {
        API(req, body, '/web/getAllowedCountries', function (status, response, msg) {
            if (status == 0) {
                oops(res, msg);
            } else {
                success(res, status, response);
            }
        });
    });
});

module.exports = router;