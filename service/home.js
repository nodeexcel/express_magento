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
    validate(req, {
        type: 'optional',
        secret: 'optional',
        mobile_width: 'required'
    }, null, function (body) {
        if (body.status == 0) {
            callback({status: 0, msg: body.body});
        } else {
            redisFetch(req, 'homeProducts_' + body.type, 'homeProducts', function (result) {
                 if (result.status == 1) {
                    callback({status: 1, msg: result.body.body});
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
                                        redisSet('homeProducts_' + body.type, {
                                            "body": response,
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
                                resize(req, image_url, function (status, image_name) {
                                    if (status == 200) {
                                        console.log(image_name)
                                        minify(req, image_name, function (status, minify_image) {
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
            redisFetch(req, 'homeCategories', null, function (result) {
                 if (result.status == 1) {
                    callback({status: 1, msg: result.body.body});
                } else {
                    API(req, body, '/home/categories/', function (status, response, msg) {
                        if (status == 0) {
                            callback({status: 0, msg: response});
                        } else {
                            redisSet('homeCategories', {
                                "body": response
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
    validate(req, {
        mobile_width: 'required'
    }, null, function (body) {
        if (body.status == 0) {
            callback({status: 0, msg: body.body});
        } else {
            redisFetch(req, 'homeSlider', 'homeSlider', function (result) {
                 if (result.status == 1) {
                    callback({status: 1, msg: result.body.body});
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
                                        redisSet('homeSlider', {
                                            "body": response
                                        }, function () {
                                            callback({status: status, msg: optmized_response});
                                        });
                                    }
                                });
                            } else {
                                callback({status: 0, msg: ERROR});
                            }
                            function processData(item, key, callback) {
                                resize(req, item, function (status, image_name) {
                                    if (status == 200) {
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