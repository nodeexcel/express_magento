require('node-import');
require('../service/validate');
require('../service/request');
require('../service/responseMsg');
imports('config/index');
imports('config/constant');
var express = require('express');
var router = express.Router();

<<<<<<< HEAD
router.post('/web/getStaticPageContent', function (req, res) {

router.post('/config', function (req, res) {
    validate(req, {
        secret: 'optional'
    }, null, function (body) {
=======
router.post('/config', function (req, res) {
    validate(req, {secret: 'optional'}, null, function (body) {
>>>>>>> cb1a537d14da937ee030fac16c499c0cc245f271
        API(req, body, '/web/config', function (status, response, msg) {
            if (status == 0) {
                oops(res, msg);
            } else {
                success(res, status, response);
            }
        });
    });
});

router.post('/getAllowedCountries', function (req, res) {
<<<<<<< HEAD
    validate(req, {
        store_id: 'required',
        secret: 'optional'
    }, null, function (body) {

=======
    validate(req, {store_id: 'required',
        secret: 'optional'}, null, function (body) {
>>>>>>> cb1a537d14da937ee030fac16c499c0cc245f271
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