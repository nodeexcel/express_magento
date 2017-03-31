require('../service/request');


module.exports = function (req, res, next) {


API(req, req.body, req.url, function (status, response, msg) {
            if (status == 0) {
                oops(res, msg);
            } else {
                success(res, response);
                // success(res, status, response);
            }
        });
};