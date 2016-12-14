var redis = require("redis"),
        client = redis.createClient();

redisFetch = function (req, productType, callback) {
    var status = req.status;
    if (req.isAdmin == true) {
        callback(null);
    } else {
        client.get(productType, function (err, object) {
            if (object && status == 'enabled') {
                callback({status: 1, body: JSON.parse(object)});
            } else {
                callback({status: 2});
            }
        });
    }
};

redisSet = function (key, value, callback) {
//    client.hmset(key, JSON.stringify(value));
    client.set(key, JSON.stringify(value));
    client.expire(key, config.CATEGORY_EXPIRESAT);
    callback();
};