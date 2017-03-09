var _underscore = require('underscore');    //UNDERSCOREJS FUNCTIONS USED
require('./responseMsg');

//FOR CHECK ALL REQUIRED PARAMETER AVAILABLE OR NOT
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
            } else if (myKey == 'sort_by') {
                if (req.body[myKey]) {
                    result[myKey] = req.body[myKey];
                } else {
                    result[myKey] = '';
                }
            } else if (myKey == 'sort_order') {
                if (req.body[myKey]) {
                    result[myKey] = req.body[myKey];
                } else {
                    result[myKey] = '';
                }
            } else if (myKey == 'fax') {
                if (req.body[myKey]) {
                    result[myKey] = req.body[myKey];
                } else {
                    result[myKey] = '';
                }
            }else if (myKey == 'options') {
                if (req.body[myKey]) {
                    result[myKey] = req.body[myKey];
                } else {
                    result[myKey] = '';
                }
            } else if (myKey == 'company') {
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
        callback(new Error('Fill required fields!'));
        // callback({status: 0, body: 'Fill required fields!'});
    } else {
        callback(false, result);
        // callback(result);
    }
};