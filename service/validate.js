var _underscore = require('underscore');
require('./responseMsg');

validate = function (req, schema, secret, callback) {
    var result = {};
    var allkeys = _underscore.keys(schema);
    var find = false;
    for (var a = 0; a < allkeys.length; a++) {
        var myKey = allkeys[a];
        if (schema[myKey] != 'optional') {
            if (myKey == 'secret') {
                result[myKey] = secret;
            }
            if (myKey == 'entity_id') {
                if (req.body[myKey]) {
                    result[myKey] = req.body[myKey];
                } else {
                    result[myKey] = '';
                }
            } else {
                if (req.body[myKey]) {
                    result[myKey] = req.body[myKey];
                } else {
                    find = true;
                    break;
                }
            }
        }
    }
    if (find == true) {
        console.log('xxx')
        callback({status: 0, body: 'Fill required fields!'});
    } else {
        console.log('xxx')
        callback(result);
    }
};