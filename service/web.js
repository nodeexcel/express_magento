require('node-import');
require('./validate');
require('./request');

//FOR GET WEB CONFIGUATION
webConfig = function (req, callback) {
    validate(req, {
        secret: 'optional'
    }, null, function (body) {
        if (body.status == 0) {
            callback({status: 0, msg: body.body});
        } else {
            API(req, body, '/web/config', function (status, response, msg) {
                if (status == 0) {
                    callback({status: 0, msg: response});
                } else {
                    callback({status: 1, msg: response});
                }
            });
        }

    });
};