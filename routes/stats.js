require('../service/responseMsg');
var express = require('express');
var router = express.Router();
var moment = require('moment');

router.post('/statistics_status', function (req, res) {
    var APP_ID = req.headers.app_id;
    staticsticAPIDB = req.staticsticAPIDB;
    validate(req, {current_date: 'required'}, null, function (body) {
        staticsticAPIDB.find({APP_ID: APP_ID, current_date: body.current_date}, function (err, dbrecord) {
            if (err) {
                oops(res, err);
            } else if (!dbrecord || dbrecord.length == '0') {
                success(res, 0, []);
            } else {
                success(res, 1, dbrecord);
            }
        });
    });
});

module.exports = router;