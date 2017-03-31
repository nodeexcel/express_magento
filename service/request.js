require('node-import');
imports('config/index');
imports('config/constant');
var request = require('request');

//FIRE ANY MAGENTO API USING REQUEST(NODE MODULE)
API = function (req, body, url, callback) {
    console.log(body);
    try {
        request({
            url: req.URL + url, //URL to hit
            method: 'post',
            headers: {APP_ID: req.headers.app_id, Authorization: req.headers.authorization},
            timeout: 60 * 1000,
            body: JSON.stringify(body)
        }, function (error, result, body) {
            if (error) {
                callback(0, error, ERROR);
            } else if (result.statusCode === 500) {
                callback(0, {}, body);
            } else if (result.statusCode === 401) {
                callback(0, {}, "UnAuthorized")
            } else {
                allData = JSON.parse(body);
                callback(1, allData, SUCCESS);
            }
        });
    } catch (ex) {
        callback(ex);
    }
};