var _underscore = require('underscore');
require('./responseMsg');

validate = function (req, schema, secret, callback) {
<<<<<<< HEAD
    
=======
>>>>>>> cb1a537d14da937ee030fac16c499c0cc245f271
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
        callback({status: 0, body: 'Fill required fields!'});
    } else {
        callback(result);
    }
};