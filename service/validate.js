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
            } else {
                result[myKey] = '';
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
            } else if (myKey == 'title') {
                if (req.body[myKey]) {
                    result[myKey] = req.body[myKey];
                } else {
                    result[myKey] = '';
                }
            } else if (myKey == 'details') {
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
            } else if (myKey == 'options') {
                if (req.body[myKey]) {
                    result[myKey] = req.body[myKey];
                } else {
                    delete result[myKey];
                }
            } else if (myKey == 'company') {
                if (req.body[myKey]) {
                    result[myKey] = req.body[myKey];
                } else {
                    result[myKey] = '';
                }
            } else if (myKey == 'super_group') {
                if (req.body[myKey]) {
                    result[myKey] = req.body[myKey];
                }else{
                    delete result[myKey];
                }
            } else if (myKey == 'bundle_option') {
                if (req.body[myKey]) {
                    result[myKey] = req.body[myKey];
                }else{
                    delete result[myKey];
                }
            } else if (myKey == 'bundle_option_qty') {
                if (req.body[myKey]) {
                    result[myKey] = req.body[myKey];
                } else{
                    delete result[myKey];
                }
            } else if (myKey == 'super_attribute') {
                if (req.body[myKey]) {
                    result[myKey] = req.body[myKey];
                }else{
                    delete result[myKey];
                }
            }else if (myKey == 'links') {
                if (req.body[myKey]) {
                    result[myKey] = req.body[myKey];
                }else{
                    delete result[myKey];
                }
            }else if (myKey == 'qty') {
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