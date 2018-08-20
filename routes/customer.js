require('node-import');
require('../service/validate');
require('../service/request');
require('../service/responseMsg');
imports('config/index');
imports('config/constant');
var express = require('express');
var router = express.Router();

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
        email: 'required'}, null, function (body) {
            body={
                "username":body.email,
                "password":body.password
            }
        API(req, body, '/rest/V1/integration/customer/token','POST', function (status, result, msg) {
            if (status == 0) {
                oops(res, msg);
            } else {
                req.headers={
                                'app_id': req.headers.app_id,
                                'authorization': "Bearer "+result
                            }
                req.URL = req.URL;
                API(req, null, '/rest/V1/customers/me', 'GET', function (status, response, msg) {
                    if (status == 0) {
                        oops(res, msg);
                    } else {
                        response.token = result;
                        success(res, status, response);
                    }
                });
            }
        });
    });
});

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
        email: 'required'}, null, function (body) {
            body= {
                'customer' : {
                        "email": body.email,
                        "firstname": body.firstname,
                        "lastname": body.lastname,
                        "defaultBilling": "",
                        "defaultShipping": "",
                        "confirmation": "",
                        "middlename": "",
                        "disableAutoGroupChange": 0,
                        "extensionAttributes": {},
                        "customAttributes": [
                        ]
                      },
                      "password": body.password,
                      "redirectUrl": ""
            }
        API(req, body, '/rest/V1/customers', 'POST', function (status, response, msg) {
            if (status == 0) {
                oops(res, msg);
            } else {
                success(res, status, response);
            }
        });
    });
});

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
                success(res, status, response);
            }
        });
    });
});

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
                success(res, status, response);
            }
        });
    });
});

module.exports = router;