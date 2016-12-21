require('node-import');
require('../service/auth');
require('../service/validate');
require('../service/request');
require('../service/responseMsg');
imports('config/index');
imports('config/constant');
var express = require('express');
var router = express.Router();

//ROUTE FOR ACCOUNT ADDRESS
router.all('/address', isAuth, function (req, res) {
    validate(req, {firstname: 'optional',
        lastname: 'optional',
        password: 'optional',
        newPassword: 'optional',
        zip: 'optional',
        secret: 'required'}, req.body.secret, function (error, body) {
        API(req, body, '/account/address/', function (status, response, msg) {
            if (status == 0) {
                oops(res, msg);
            } else {
                success(res, response);
                // success(res, status, response);
            }
        });
    });
});

//ROUTE FOR CHANGE PASSWORD
router.post('/changepassword', isAuth, function (req, res) {
    validate(req, {firstname: 'optional',
        lastname: 'optional',
        password: 'required',
        newPassword: 'required',
        zip: 'optional',
        secret: 'required'}, req.body.secret, function (error, body) {
        API(req, body, '/account/changepassword/', function (status, response, msg) {
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