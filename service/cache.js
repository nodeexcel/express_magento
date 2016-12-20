var redis = require("redis"),
        client = redis.createClient();
require('./statistic');

//FOR GET DATA FROM RADIS
redisFetch = function (req, productType, APIName, callback) {
    var status = req.status;
    if (req.isAdmin == true) {
        callback(new Error('Not Admin'));
    } else {
        client.get(productType, function (err, object) {
            if (object && status == "enabled") {
//                    FOR SET VALUE OF STATISTIC(Category Products API), DATA IS COMING FROM REDIS
                setStatisticRedis(APIName, req);
                   var isRedis = true;
                callback(false, JSON.parse(object), isRedis);
            } else {
//                      FOR SET VALUE OF STATISTIC(Category Products API), DATA IS COMING FROM MAGENTO
                setStatisticMagento(APIName, req);
                callback(new Error('Cache Disabled'));
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