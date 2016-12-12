imports('config/index');
imports('config/constant');
require('node-import');
require('./validate');
require('./image');
require('./request');
require('./cache');
require('./statistic');
require('./responseMsg');
require('../mods/schema');
var express = require('express');
var router = express.Router();
var async = require('async');
var redis = require("redis"),
        client = redis.createClient();

//FOR GET HOME PRODUCTS LIST
homeProducts = function (req, callback) {
    var APP_ID = req.headers.app_id;
    validate(req, {
        type: 'optional',
        secret: 'optional',
        mobile_width: 'required'
    }, null, function (body) {
        if (body.status == 0) {
            callback({status: 0, msg: body.body});
        } else {
            var key = 'type';
            redisFetch(req, 'products_', body.type, key, 'homeProducts', function (result) {
                if (result.status == 0) {
                    callback({status: 0, msg: result.body});
                } else if (result.status == 1) {
                    callback({status: 1, msg: result.body});
                } else {
                    API(req, body, '/home/products/', function (status, response, msg) {
                        if (status == 0) {
                            callback({status: 0, msg: response});
                        } else {
                            if (response !== undefined) {
                                var optmized_response = [];
                                async.eachOfLimit(response, 5, processData, function (err) {
                                    if (err) {
                                        callback({status: 0, msg: 'OOPS! How is this possible?'});
                                    } else {
                                        redisSet('products_' + body.type, {
                                            "body": JSON.stringify(response),
                                            "type": body.type
                                        }, function () {
                                            callback({status: status, msg: optmized_response});
                                        });
                                    }
                                });
                            } else {
                                callback({status: 0, msg: ERROR});
                            }
                            function processData(item, key, callback) {
                                var image_url = item.data.small_image;
                                resize(image_url, APP_ID, body.mobile_width, function (status, image_name) {
                                    if (status == '200') {
                                        minify(image_name, APP_ID, body.mobile_width, function (status, minify_image) {
                                            item.data.small_image = image_name;
                                            item.data.minify_image = minify_image;
                                            optmized_response[key] = item;
                                            callback(null);
                                        });
                                    } else {
                                        item.data.small_image = image_url;
                                        item.data.minify_image = image_url;
                                        optmized_response[key] = item;
                                        callback(null);
                                    }
                                });
                            }
                        }
                    });
                }
            });
        }
    });
};

//FOR GET HOME CATEGORIES
homeCategories = function (req, callback) {
    validate(req, {}, null, function (body) {
        if (body.status == 0) {
            callback({status: 0, msg: body.body});
        } else {
            var key = null;
            redisFetch(req, 'categories', null, key, function (result) {
                if (result.status == 0) {
                    callback({status: 0, msg: result.body});
                } else if (result.status == 1) {
                    callback({status: 1, msg: result.body});
                } else {
                    API(req, body, '/home/categories/', function (status, response, msg) {
                        if (status == 0) {
                            callback({status: 0, msg: response});
                        } else {
                            redisSet('categories', {
                                "body": JSON.stringify(response)
                            }, function () {
                                callback({status: status, msg: response});
                            });
                        }
                    });
                }
            });
        }
    });
};

//FOR GET HOME SLIDER URL LIST
homeSlider = function (req, callback) {
    var APP_ID = req.headers.app_id;
    validate(req, {
        mobile_width: 'required'
    }, null, function (body) {
        if (body.status == 0) {
            callback({status: 0, msg: body.body});
        } else {
            var key = null;
            redisFetch(req, 'slider', null, key, 'homeSlider', function (result) {
                if (result.status == 0) {
                    callback({status: 0, msg: result.body});
                } else if (result.status == 1) {
                    callback({status: 1, msg: result.body});
                } else {
                    API(req, body, '/home/slider/', function (status, response, msg) {
                        if (status == 0) {
                            callback({status: 0, msg: response});
                        } else {
//                            callback({status: 0, msg: response});
                            if (response.url !== undefined) {
                                var optmized_response = [];
                                async.eachOfLimit(response.url, 5, processData, function (err) {
                                    if (err) {
                                        callback({status: 0, msg: "OOPS! How is this possible?"});
                                    } else {
                                        client.hmset('slider', {
                                            "body": JSON.stringify(response),
                                            "status": 1,
                                            "statuscode": msg
                                        });
                                        client.expire('categories', config.PRODUCT_EXPIRESAT);
                                        callback({status: status, msg: optmized_response});
                                    }
                                });
                            } else {
                                callback({status: 0, msg: ERROR});
                            }
                            function processData(item, key, callback) {
                                resize(item, APP_ID, body.mobile_width, function (status, image_name) {
                                    if (status == '200') {
                                        item = image_name;
                                        optmized_response[key] = item;
                                        callback(null);
                                    } else {
                                        item = item;
                                        optmized_response[key] = item;
                                        callback(null);
                                    }
                                });
                            }
                        }
                    });
                }
            });
        }
    });
};