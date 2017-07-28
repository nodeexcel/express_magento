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
router.all('/address', isAuth, function(req, res) {
    validate(req, {
        firstname: 'optional',
        lastname: 'optional',
        password: 'optional',
        newPassword: 'optional',
        zip: 'optional',
        secret: 'required'
    }, req.body.secret, function(error, body) {
        API(req, body, '/account/address/', function(status, response, msg) {
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
router.post('/changepassword', isAuth, function(req, res) {
    validate(req, {
        firstname: 'optional',
        lastname: 'optional',
        password: 'required',
        newPassword: 'required',
        zip: 'optional',
        secret: 'required'
    }, req.body.secret, function(error, body) {
        API(req, body, '/account/changepassword/', function(status, response, msg) {
            if (status == 0) {
                oops(res, msg);
            } else {
                success(res, response);
                // success(res, status, response);
            }
        });
    });
});

router.post('/edit', isAuth, function(req, res) {
    validate(req, {
        firstname: 'required',
        lastname: 'required',
        email: 'required',
        email_check: 'required',
        websiteId: 'required',
        secret: 'required'
    }, req.body.secret, function(error, body) {
        API(req, body, '/account/edit/', function(status, response, msg) {
            if (status == 0) {
                oops(res, msg);
            } else {
                success(res, response);
                // success(res, status, response);
            }
        });
    });
});

router.post('/removeWishlist', isAuth, function(req, res) {
    validate(req, {
        itemId: 'required',
        secret: 'required'
    }, req.body.secret, function(error, body) {
        API(req, body, '/account/removeWishlist/', function(status, response, msg) {
            if (status == 0) {
                oops(res, msg);
            } else {
                success(res, response);
                // success(res, status, response);
            }
        });
    });
});

router.post('/addWishlist', isAuth, function(req, res) {
    validate(req, {
        productId: 'required',
        qty: 'required',
        super_group:'required',
        bundle_option:'required',
        bundle_option_qty:'required',
        super_attribute:'required',
        links:'required',
        secret: 'required'
    }, req.body.secret, function(error, body) {
        API(req, body, '/account/addWishlist/', function(status, response, msg) {
            if (status == 0) {
                oops(res, msg);
            } else {
                success(res, response);
                // success(res, status, response);
            }
        });
    });
});

router.post('/getWishlist', isAuth, function(req, res) {
    validate(req, {
        secret: 'required'
    }, req.body.secret, function(error, body) {
        API(req, body, '/account/getWishlist/', function(status, response, msg) {
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