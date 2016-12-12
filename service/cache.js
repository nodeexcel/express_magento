var redis = require("redis"),
        client = redis.createClient();
require('./statistic');

//FOR GET DATA FROM RADIS
redisFetch = function (req, productType, id, key, APIName, callback) {
    var status = req.status;
    if (req.isAdmin == true) {
        callback(null);
    } else {
        if (key == 'id') {
            var setProductType = productType + id;
        } else {
            setProductType = productType;
        }
        client.hgetall(setProductType, function (err, object) {
            if (err) {
                callback({status: 0, body: err});
            } else {
                if (id) {
                    if (object !== null && object[key] == id && status == "enabled") {
//                    FOR SET VALUE OF STATISTIC(Category Products API), DATA IS COMING FROM REDIS
                        setStatisticRedis(APIName);
                        callback({status: 1, body: object});
                    } else {
//                      FOR SET VALUE OF STATISTIC(Category Products API), DATA IS COMING FROM MAGENTO
                        setStatisticMagento(APIName);
                        callback({status: 2});
                    }
                } else {
                    if (object != null && status == 'enabled') {
//                    FOR SET VALUE OF STATISTIC(Category Products API), DATA IS COMING FROM REDIS
                        setStatisticRedis(APIName);
                        callback({status: 1, body: object});
                    } else {
//                      FOR SET VALUE OF STATISTIC(Category Products API), DATA IS COMING FROM MAGENTO
                        setStatisticMagento(APIName);
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