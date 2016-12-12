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
var fileExists = require('file-exists');
var URL_ = require('url');
var async = require('async');

productGet = function (req, callback) {
    var APP_ID = req.headers.app_id;
    validate(req, {sku: 'required',
        secret: 'optional'}, null, function (body) {
        if (body.status == 0) {
            callback({status: 0, msg: body.body});
        } else {
            redisFetch(req, 'product_', body.parent_id, null, function (result) {
                if (result.status == 0) {
                    callback({status: 0, msg: result.body});
                } else if (result.status == 1) {
                    callback({status: 1, msg: result.body});
                } else {
                    API(req, body, '/product/get/', function (status, response, msg) {
                        if (status == 0) {
                            callback({status: 0, msg: response});
                        } else {
                            if (req.isAdmin == true) {
                                if (response.data.media_images !== undefined) {
                                    var optmized_response = [];
                                    var minify_imag = [];
                                    async.eachOfLimit(response.data.media_images, 1, processData, function (err) {
                                        response.data.media_images = optmized_response;
                                        response.data.minify_image = minify_imag;
                                        if (err) {
                                            callback({status: 0, msg: 'OOPS! How is this possible?'});
                                        } else {
                                            redisSet('product_' + body.sku, {
                                                'id': body.sku,
                                                "body": JSON.stringify(response)
                                            }, function () {
                                                callback({status: status, msg: response})
                                            });
                                        }
                                    });
                                } else {
                                    callback({status: 0, msg: ERROR});
                                }
                                function processData(image_url, key, callback) {
                                    resize(image_url, APP_ID, function (status, image_name) {
                                        if (status == "200") {
                                            minify(image_name, APP_ID, function (status, minify_image) {
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
                            } else {
                                var sendResponse = [];
                                for (var i = 0; i < response.data.media_images.length; i++) {
                                    var imageName = response.data.media_images[i].substring(response.data.media_images[i].lastIndexOf('/') + 1);
                                    if (fileExists('public/original_image/' + imageName) == false) {
                                        if (imageName == 'no_selection') {
                                            response.data.media_images[i] = config.DEFAULT_IMAGE_URL;
                                            response.data.minify_image[i] = config.DEFAULT_IMAGE_URL;
                                            sendResponse[i] = response[i];
                                        } else {
                                            sendResponse[i] = response;
                                        }
                                    } else {
                                        var app_id = APP_ID.replace(/[^a-zA-Z0-9 ]/g, "");
                                        var imageUrl = URL_.parse(response.data.media_images[i]).path;
                                        response.data.media_images[i] = config.CDN_URL + app_id + imageUrl;
                                        response.data.minify_image[i] = config.CDN_URL + app_id + '/minify' + imageUrl;
                                        sendResponse = response;
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

productReview = function (req, callback) {
    validate(req, {sku: 'required',
        secret: 'optional',
        pageno: 'required'}, null, function (body) {
        if (body.status == 0) {
            callback({status: 0, msg: body.body});
        } else {
            redisFetch(req, 'product_', body.parent_id, null, function (result) {
                if (result.status == 0) {
                    callback({status: 0, msg: result.body});
                } else if (result.status == 1) {
                    callback({status: 1, msg: result.body});
                } else {
                    API(req, body, '/product/review/', function (status, response, msg) {
                        if (status == 0) {
                            callback({status: 0, msg: response});
                        } else {
                            redisSet('product_' + body.sku, {
                                'id': body.sku,
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

productGetRating = function (req, callback) {
    validate(req, {}, null, function (body) {
        if (body.status == 0) {
            callback({status: 0, msg: body.body});
        } else {
            if (req.URL) {
                redisFetch(req, 'product_', null, null, function (result) {
                    if (result.status == 0) {
                        callback({status: 0, msg: result.body});
                    } else if (result.status == 1) {
                        callback({status: 1, msg: result.body});
                    } else {
                        API(req, body, '/product/getrating/', function (status, response, msg) {
                            if (status == 0) {
                                callback({status: 0, msg: response});
                            } else {
                                redisSet('product_', {
                                    "body": JSON.stringify(response),
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