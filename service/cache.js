var redis = require("redis"),
        client = redis.createClient();

//FOR GET DATA FROM RADIS
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

//FUNCTION FOR SET DATA IN REDIS
redisSet = function (key, value, callback) {
    client.hmset(key, value);
    client.expire(key, config.CATEGORY_EXPIRESAT);
    callback();
};