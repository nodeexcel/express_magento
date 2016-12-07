var redis = require("redis"),
        client = redis.createClient();

redisFetch = function (req, productType, id, type, callback) {
    var status = req.status;
    if (req.isAdmin == true) {
        callback(null);
    } else {
        client.hgetall(productType + id, function (err, object) {
            if (err) {
                callback({status: 0, body: err});
            } else {
                if (id) {
                    if (object !== null && object.id == id && status == "enabled") {
                        callback({status: 1, body: object});
                    } else {
                        callback({status: 2});
                    }
                } else if (!id && type) {
                    if (object != null && object.type == type && status == "enabled") {
                        callback({status: 1, body: object});
                    } else {
                        callback({status: 2});
                    }
                } else {
                    if (object != null && status == 'enabled') {
                        callback({status: 1, body: object});
                    } else {
                        callback({status: 2});
                    }
                }
            }
        });
    }
};

//redisSet = function (catType, id, limit, optmized_response, type, callback) {
redisSet = function (key, value, callback) {
    client.hmset(key, value);
    client.expire(key, config.CATEGORY_EXPIRESAT);
    callback();
};

//redisSet = function (catType, id, limit, optmized_response, type, callback) {
//    if (type == null) {
//        type = '';
//    }
//    if (id == null) {
//        id = '';
//    }
//    if (limit == null) {
//        limit = '';
//    }
//    client.hmset(catType + id, {
//        'id': id,
//        "limit": limit,
//        "body": JSON.stringify(optmized_response),
//        "type": type
//    });
//    if (id) {
//        client.expire(catType + id, config.CATEGORY_EXPIRESAT);
//    } else if (!id && type) {
//        client.expire(catType + type, config.CATEGORY_EXPIRESAT);
//    } else {
//        client.expire(catType, config.CATEGORY_EXPIRESAT);
//    }
//    callback();
//};