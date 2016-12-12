require('node-import');
require('./validate');
require('./image');
require('./request');
require('./cache');
require('./responseMsg');
imports('config/index');
imports('config/constant');
var express = require('express');
var router = express.Router();
var async = require('async');
var URL_ = require('url');
var fileExists = require('file-exists');
var redis = require("redis"),
        client = redis.createClient();

homeProducts = function (req, callback) {
    var APP_ID = req.headers.app_id;
    validate(req, {
        type: 'optional',
        secret: 'optional',
    }, null, function (body) {
        if (body.status == 0) {
            callback({status: 0, msg: body.body});
        } else {
            redisFetch(req, 'products_', null, body.type, function (result) {
                if (result.status == 0) {
                    callback({status: 0, msg: result.body});
                } else if (result.status == 1) {
                    callback({status: 1, msg: result.body});
                } else {
                    API(req, body, '/home/products/', function (status, response, msg) {
                        if (status == 0) {
                            callback({status: 0, msg: response});
                        } else {
                            if (req.isAdmin == true) {
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
                                    resize(image_url, APP_ID, function (status, image_name) {
                                        if (status == '200') {
                                            minify(image_name, APP_ID, function (status, minify_image) {
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
                            } else {
                                var sendResponse = [];
                                for (var i = 0; i < response.length; i++) {
                                    var imageName = response[i].data.small_image.substring(response[i].data.small_image.lastIndexOf('/') + 1);
                                    if (fileExists('public/original_image/' + imageName) == false) {
                                        if (imageName == 'no_selection') {
                                            response[i].data.small_image = config.DEFAULT_IMAGE_URL;
                                            response[i].data.minify_image = config.DEFAULT_IMAGE_URL;
                                            sendResponse[i] = response[i];
                                        } else {
                                            sendResponse[i] = response[i];
                                        }

                                    } else {
                                        var app_id = APP_ID.replace(/[^a-zA-Z0-9 ]/g, "");
                                        var imageUrl = URL_.parse(response[i].data.small_image).path;
                                        response[i].data.small_image = config.CDN_URL + app_id + imageUrl;
                                        response[i].data.minify_image = config.CDN_URL + app_id + '/minify' + imageUrl;
                                        sendResponse[i] = response[i];
                                    }
                                }
                                callback({status: status, msg: sendResponse});
                            }
                        }
                    });
                }
            });
        }
    });
};

homeCategories = function (req, callback) {
    validate(req, {}, null, function (body) {
        if (body.status == 0) {
            callback({status: 0, msg: body.body});
        } else {
            redisFetch(req, 'categories', null, null, function (result) {
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

homeSlider = function (req, callback) {
    var APP_ID = req.headers.app_id;
    validate(req, {
    }, null, function (body) {
        if (body.status == 0) {
            callback({status: 0, msg: body.body});
        } else {
            redisFetch(req, 'slider', null, null, function (result) {
                if (result.status == 0) {
                    callback({status: 0, msg: result.body});
                } else if (result.status == 1) {
                    callback({status: 1, msg: result.body});
                } else {
                    API(req, body, '/home/slider/', function (status, response, msg) {
                        if (status == 0) {
                            callback({status: 0, msg: response});
                        } else {
                            if (req.isAdmin == true) {
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
                                    resize(item, APP_ID, function (status, image_name) {
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
                            } else {
                                var sendResponse = [];
                                for (var i = 0; i < response.url.length; i++) {
                                    var imageName = response.url[i].substring(response.url[i].lastIndexOf('/') + 1);
                                    if (fileExists('public/original_image/' + imageName) == false) {
                                        sendResponse.push(response.url[i])
                                    } else {
                                        var imageUrl = URL_.parse(response.url[i]).path;
                                        sendResponse.push(config.CDN_URL + APP_ID + imageUrl);
                                    }
                                }
                                response.url = sendResponse;
                                callback({status: status, msg: response});
                            }
                        }
                    });
                }
            });
        }
    });
};