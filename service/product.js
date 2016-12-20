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

//FOR GET PRODUCTS
productGet = function (req, callback) {
    validate(req, {
        sku: 'required',
        secret: 'optional'
    }, null, function (body) {
        if (body.status == 0) {
            callback({status: 0, msg: body.body});
        } else {
            redisFetch(req, 'productGet_' + body.sku, 'productGet', function (error, result) {
                if (result) {
                    callback({status: 1, msg: result.body});
                } else {
                    API(req, body, '/product/get/', function (status, response, msg) {
                        if (status == 0) {
                            callback({status: 0, msg: response});
                        } else {
//                            callback({status: status, msg: response});
                            if (response.data.media_images !== undefined) {
                                var optmized_response = [];
                                var minify_imag = [];
                                async.eachOfLimit(response.data.media_images, 1, processData, function (err) {
                                    response.data.media_images = optmized_response;
                                    response.data.minify_image = minify_imag;
                                    if (err) {
                                        callback({status: 0, msg: 'OOPS! How is this possible?'});
                                    } else {
                                        redisSet('productGet_' + body.sku, {
                                            'id': body.sku,
                                            "body": response
                                        }, function () {
                                            callback({status: status, msg: response});
                                        });
                                    }
                                });
                            } else {
                                callback({status: 0, msg: ERROR});
                            }
                            function processData(image_url, key, callback) {
                                resize(req, image_url, function (status, image_name) {
                                    if (status == 200) {
                                        minify(req, image_name, function (status, minify_image) {
                                            optmized_response.push(image_name);
                                            minify_imag.push(minify_image);
                                            callback(null);
                                        });
                                    } else {
                                        optmized_response.push(image_url);
                                        minify_imag.push(image_url);
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

//FOR GET PRODUCT REVIEW
productReview = function (req, callback) {
    validate(req, {
        sku: 'required',
        secret: 'optional',
        page: 'required'
    }, null, function (body) {
        if (body.status == 0) {
            callback({status: 0, msg: body.body});
        } else {
            redisFetch(req, 'productReview_' + body.sku + '_' + body.page, 'productReview', function (error, result) {
                if (result) {
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

//FOR GET PRODUCT RATING
//RESPONSE - {"data":{"max_review":5,"attribute":{"1":"Quality","2":"Value","3":"Price"},"options":{"1":["1","2","3","4","5"],"2":["6","7","8","9","10"],"3":["11","12","13","14","15"]}},"status":1,"message":"success"}
productGetRating = function (req, callback) {
    validate(req, {}, null, function (body) {
        if (body.status == 0) {
            callback({status: 0, msg: body.body});
        } else {
            if (req.URL) {
                redisFetch(req, 'productGetRating', 'productGetRating', function (error, result) {
                    if (result) {
                        callback({status: 1, msg: result.body});
                    } else {
                        API(req, body, '/product/getrating/', function (status, response, msg) {
                            if (status == 0) {
                                callback({status: 0, msg: response});
                            } else {
                                redisSet('productGetRating', {
                                    "body": response
                                }, function () {
                                    callback({status: status, msg: response});
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