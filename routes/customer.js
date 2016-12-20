require('node-import');
require('../service/validate');
require('../service/request');
require('../service/responseMsg');
imports('config/index');
imports('config/constant');
var express = require('express');
var router = express.Router();

//ROUTE FOR CUSTOMER LOGIN
router.post('/login', function (req, res) {
    validate(req, {countryid: 'optional',
        zip: 'optional',
        city: 'optional',
        telephone: 'optional',
        fax: 'optional',
        company: 'optional',
        street: 'optional',
        firstname: 'optional',
        lastname: 'optional',
        password: 'required',
        newPassword: 'optional',
        secret: 'optional',
        entity_id: 'optional',
        productid: 'optional',
        store_id: 'optional',
        parent_id: 'optional',
        type: 'optional',
        website_id: 'required',
        email: 'required'}, null, function (body) {
        API(req, body, '/customer/login/', function (status, response, msg) {
            if (status == 0) {
                oops(res, msg);
            } else {
                success(res,response);
                // success(res, status, response);
            }
        });
    });
});

//ROUTE FOR CUSTOMER REGISTER
router.post('/register', function (req, res) {
    validate(req, {countryid: 'optional',
        zip: 'optional',
        city: 'optional',
        telephone: 'optional',
        fax: 'optional',
        company: 'optional',
        street: 'optional',
        firstname: 'required',
        lastname: 'required',
        password: 'required',
        newPassword: 'optional',
        secret: 'optional',
        entity_id: 'optional',
        productid: 'optional',
        store_id: 'optional',
        parent_id: 'optional',
        type: 'optional',
        website_id: 'required',
        email: 'required'}, null, function (body) {
        API(req, body, '/customer/register/', function (status, response, msg) {
            if (status == 0) {
                oops(res, msg);
            } else {
                success(res,response);
                // success(res, status, response);
            }
        });
    });
});

//ROUTE FOR FORGET PASSWORD
router.post('/forgot', function (req, res) {
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
        secret: 'optional',
        entity_id: 'optional',
        productid: 'optional',
        store_id: 'optional',
        parent_id: 'optional',
        type: 'optional',
        website_id: 'required',
        email: 'required'}, null, function (body) {
        API(req, body, '/customer/forgot/', function (status, response, msg) {
            if (status == 0) {
                oops(res, msg);
            } else {
                success(res,response);
                // success(res, status, response);
            }
        });
    });
});

//ROUTE FOR GETTING SOCIAL ACCOUNT
router.post('/social_account', function (req, res) {
    validate(req, {countryid: 'optional',
        zip: 'optional',
        city: 'optional',
        telephone: 'optional',
        fax: 'optional',
        company: 'optional',
        street: 'optional',
        firstname: 'required',
        lastname: 'required',
        password: 'optional',
        newPassword: 'optional',
        secret: 'optional',
        entity_id: 'optional',
        productid: 'optional',
        store_id: 'optional',
        parent_id: 'optional',
        type: 'optional',
        website_id: 'required',
        email: 'required',
        social: 'required',
        social_id: 'required'}, null, function (body) {
        API(req, body, '/customer/social_account/', function (status, response, msg) {
            if (status == 0) {
                oops(res, msg);
            } else {
                success(res,response);
                // success(res, status, response);
            }
        });
    });
});

module.exports = router;