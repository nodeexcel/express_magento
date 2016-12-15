var redis = require("redis"),
        client = redis.createClient();
require('./statistic');

//FOR GET DATA FROM RADIS
redisFetch = function (req, productType, APIName, callback) {
    var status = req.status;
    if (req.isAdmin == true) {
        callback({status: 0});
    } else {
        client.get(productType, function (err, object) {
            if (object && status == "enabled") {
//                    FOR SET VALUE OF STATISTIC(Category Products API), DATA IS COMING FROM REDIS
                setStatisticRedis(APIName, req);
                callback({status: 1, body: JSON.parse(object)});
            } else {
//                      FOR SET VALUE OF STATISTIC(Category Products API), DATA IS COMING FROM MAGENTO
                setStatisticMagento(APIName, req);
                callback({status: 2});
            }
        });
    }
};

//FUNCTION FOR SET DATA IN REDIS
redisSet = function (key, value, callback) {
    client.set(key, JSON.stringify(value));
    client.expire(key, config.CATEGORY_EXPIRESAT);
    callback();
};