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
            success(res, body.msg);
            // success(res, 1, body.msg);
        }
    });
});

router.post('/getAllowedCountries', function (req, res) {
    validate(req, {
        store_id: 'required',
        secret: 'optional'
    }, null, function (error, body) {
        API(req, body, '/web/getAllowedCountries', function (status, response, msg) {
            if (status == 0) {
                oops(res, msg);
            } else {
                success(res, response);
                // success(res, status, response);
            }
        });
    });
});

router.post('/getStaticPageContent', function (req, res) {
    validate(req, {
        store_id: 'required',
        secret: 'optional',
        page_code: 'required'
    }, null, function (error, body) {
        API(req, body, '/web/getStaticPageContent', function (status, response, msg) {
            if (status == 0) {
                oops(res, msg);
            } else {
                success(res, response);
                // success(res, status, response);
            }
        });
    });
});

router.post('/contactus', function (req, res) {
    validate(req, {
        name: 'required',
        email: 'required',
        comment: 'required',
        secret: 'optional',
        telephone: 'required'
    }, null, function (error, body) {
        API(req, body, '/web/contactus', function (status, response, msg) {
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