require('node-import');
imports('config/index');
imports('config/constant');
var request = require('request');

API = function (req, body, url, callback) {
    request({
        url: 'http://'+ req.URL + url, //URL to hit
        method: 'post',
        headers: {APP_ID: req.headers.app_id, "Authorization": req.headers.authorization},
        timeout: 10000,
        body: JSON.stringify(body)
    }, function (error, result, body) {
        console.log(error)
        if (error) {
            callback(0, error, ERROR);
        } else if (result.statusCode === 500) {
            var allData = JSON.parse(body);
            callback(0, allData.data, NOTFOUND);
        } else {
            allData = JSON.parse(body);
            callback(1, allData.data, SUCCESS);
        }
    });
};