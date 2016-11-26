require('node-import');
require('../service/auth');
require('../service/validate');
require('../service/request');
imports('config/index');
imports('config/constant');
var express = require('express');
var router = express.Router();

router.post('/edit', isAuth, function (req, res) {
    validate(req, res, {countryid: 'required',
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
        API(req, res, body, '/address/edit/', function (status, response, msg) {
            res.json({status: status, statuscode: msg, body: JSON.parse(response)});
        });
    });
});

router.post('/delete', isAuth, function (req, res) {
    validate(req, res, {countryid: 'optional',
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
        API(req, res, body, '/address/delete/', function (status, response, msg) {
            res.json({status: status, statuscode: msg, body: JSON.parse(response)});
        });
    });
});

module.exports = router;