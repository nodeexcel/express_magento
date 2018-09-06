require('node-import');
imports('config/index');
imports('config/constant');
var request = require('request');

API = function (req, body, url, method, callback) {
    console.log("************************************************************************");
    console.log(req.URL + url);
    console.log("************************************************************************");
    request({
        protocol: 'http:',
        url: req.URL + url, //URL to hit
        method: method,
        headers: {APP_ID: req.headers.app_id, "Authorization": req.headers.authorization, 'Content-Type': 'application/json',},
        timeout: 10000,
        body: JSON.stringify(body)
    }, function (error, result, body) {
        if (error) {
            callback(0, error, ERROR);
        } else if (result.statusCode === 500) {
            var allData = JSON.parse(body);
            callback(0, allData.data, NOTFOUND);
        } else {
            allData = JSON.parse(body);
            if (allData.data) {
            callback(1, allData.data, SUCCESS);
            } else {
                callback(1, allData, SUCCESS);
            }
        }
    });
};