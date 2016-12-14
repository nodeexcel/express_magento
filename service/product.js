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

productGet = function (req, callback) {
    var APP_ID = req.headers.app_id;
    validate(req, {
        sku: 'required',
        secret: 'optional',
        mobile_width: 'required'
    }, null, function (body) {
        if (body.status == 0) {
            callback({status: 0, msg: body.body});
        } else {
//            redisFetch(req, 'product_', body.parent_id, null, function (result) {
            redisFetch(req, 'productGet_' + body.sku, function (result) {
                if (result.status == 0) {
                    callback({status: 0, msg: result.body});
                } else if (result.status == 1) {
                    callback({status: 1, msg: result.body});
                } else {
                    API(req, body, '/product/get/', function (status, response, msg) {
                        if (status == 0) {
                            callback({status: 0, msg: response});
                        } else {
                            if (response !== undefined) {
                                var optmized_response = {};
                                async.eachOfLimit(response, 1, processData, function (err) {
                                    if (err) {
                                        callback({status: 0, msg: 'OOPS! How is this possible?'});
                                    } else {
                                        redisSet('productGet_' + body.sku, {
                                            'id': body.sku,
                                            "body": optmized_response
                                        }, function () {
                                            callback({status: status, msg: optmized_response})
                                        });
                                    }
                                });
                            } else {
                                callback({status: 0, msg: ERROR});
                            }
                            function processData(item, key, callback) {
                                var image_url = item.small_image;
                                resize(image_url, APP_ID, body.mobile_width, function (status, image_name) {
                                    if (status == "200") {
                                        minify(image_name, APP_ID, function (status, minify_image) {
                                            item.small_image = image_name;
                                            item.minify_image = minify_image;
                                            optmized_response[key] = item;
                                            callback(null);
                                        });
                                    } else {
                                        item.small_image = image_url;
                                        item.minify_image = image_url;
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

productReview = function (req, callback) {
    validate(req, {
        sku: 'required',
        secret: 'optional',
        mobile_width: 'required',
        page: 'required'
    }, null, function (body) {
        if (body.status == 0) {
            callback({status: 0, msg: body.body});
        } else {
//            redisFetch(req, 'product_', body.parent_id, null, function (result) {
            redisFetch(req, 'productReview_' + body.sku + '_' + body.page, function (result) {
                if (result.status == 0) {
                    callback({status: 0, msg: result.body});
                } else if (result.status == 1) {
                    callback({status: 1, msg: result.body});
                } else {
                    API(req, body, '/product/review/', function (status, response, msg) {
                        if (status == 0) {
                            callback({status: 0, msg: response});
                        } else {
                            redisSet('productReview_' + body.sku + '_' + body.page, {
                                'id': body.sku,
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

productGetRating = function (req, callback) {
    validate(req, {}, null, function (body) {
        if (body.status == 0) {
            callback({status: 0, msg: body.body});
        } else {
            if (req.URL) {
//                redisFetch(req, 'product_', null, null, function (result) {
                redisFetch(req, 'productGetRating', function (result) {
                    if (result.status == 0) {
                        callback({status: 0, msg: result.body});
                    } else if (result.status == 1) {
                        callback({status: 1, msg: result.body});
                    } else {
                        API(req, body, '/product/getrating/', function (status, response, msg) {
                            if (status == 0) {
                                callback({status: 0, msg: response});
                            } else {
                                redisSet('productGetRating', {
                                    "body": response,
                                }, function () {
                                    callback({status: status, msg: response})
                                });
                            }
                        });
                    }
                });
            } else {
                callback({status: 0, msg: INVALID});
            }
        }
    });
};