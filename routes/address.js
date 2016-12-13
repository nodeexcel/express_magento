require('node-import');
require('../service/auth');
require('../service/validate');
require('../service/request');
require('../service/responseMsg');
imports('config/index');
imports('config/constant');
var express = require('express');
var router = express.Router();

//ROUTE FOR EDIT CUSTOMER INFORMATION
router.post('/edit', isAuth, function (req, res) {
    validate(req, {countryid: 'required',
        zip: 'required',
        city: 'required',
        telephone: 'required',
        fax: 'required',
        company: 'required',
        street: 'required',
        firstname: 'required',
        lastname: 'required',
        password: 'optional',
        newPassword: 'optional',
        secret: 'required',
        entity_id: 'required'}, req.body.secret, function (body) {
        API(req, body, '/address/edit/', function (status, response, msg) {
            if (status == 0) {
                oops(res, msg);
            } else {
                success(res, status, response);
            }
        });
    });
});

//ROUTE FOR DELETE CUSTOMER ADDRESS
router.post('/delete', isAuth, function (req, res) {
    validate(req, {countryid: 'optional',
        zip: 'optional',
        city: 'optional',
        telephone: 'optional',
        fax: 'optional',
        company: 'optional',
        street: 'optional',
        firstname: 'optional',
        lastname: 'optional',
        password: 'optional',
        newPassword: 'optional',
        secret: 'required',
        entity_id: 'required'}, req.body.secret, function (body) {
        API(req, body, '/address/delete/', function (status, response, msg) {
            if (status == 0) {
                oops(res, msg);
            } else {
                success(res, status, response);
            }
        });
    });
});

module.exports = router;