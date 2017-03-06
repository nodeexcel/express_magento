imports('config/index');
imports('config/constant');
require('node-import');
require('./validate');
require('./image');
require('./request');
require('./cache');
require('./responseMsg');
require('./statistic');
require('../mods/schema');
var express = require('express');
var router = express.Router();
var async = require('async');

//FOR GET CATEGORY PRODUCTS
categoryProducts = function (req, callback) {
    validate(req, {
        countryid: 'optional',
        zip: 'optional',
        city: 'optional',
        telephone: 'optional',
        fax: 'optional',
        company: 'optional',
        street: 'optional',
        firstname: 'optional',
        lastname: 'optional',
        password: 'optional',
        newPassword: 'optional',
        secret: 'optional',
        entity_id: 'optional',
        productid: 'optional',
        store_id: 'optional',
        parent_id: 'optional',
        type: 'optional',
        limit: 'required',
        id: 'required',
        page: 'required',
        sort_by:'required',
        sort_order:'required'
    }, null, function (error, body) {
        if (error) {
            callback({status: 0, msg: error});
        } else {
            redisFetch(req, 'categoryProducts_' + body.id + '_' + body.page, 'categoryProducts', function (error, result, res) {
                if (result) {
                    callback({status: 1, msg: result.body.url, isRedis: res});
                } else {
                    API(req, body, '/category/products/', function (status, response, msg) {
                        if (status == 0) {
                            callback({status: 0, msg: msg});
                        } else {
//                            callback({status: status, msg: response});
                            if (response.data !== undefined) {
                                var optmized_response = [];
                                async.eachOfLimit(response.data, 5, processData, function (err) {
                                    if (err) {
                                        callback({status: 0, msg: 'OOPS! How is this possible?'});
                                    } else {
                                        redisSet('categoryProducts_' + body.id + '_' + body.page, {
                                            'id': body.id,
                                            "limit": body.limit,
                                            "body": optmized_response
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
                                        minify(req, image_name, function (status, minify_image) {
                                            item.data.small_image = image_name;
                                            item.data.minify_image = minify_image;
                                            item.data.media_images = false;
                                            optmized_response[key] = item;
                                            callback(null);
                                        });
                                    } else {
                                        item.data.small_image = image_url;
                                        item.data.minify_image = image_url;
                                        item.data.media_images = false;
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

//FOR GET CATEGORY LIST
categoryList = function (req, callback) {
    validate(req, {
        countryid: 'optional',
        zip: 'optional',
        city: 'optional',
        telephone: 'optional',
        fax: 'optional',
        company: 'optional',
        street: 'optional',
        firstname: 'optional',
        lastname: 'optional',
        password: 'optional',
        newPassword: 'optional',
        secret: 'optional',
        entity_id: 'optional',
        productid: 'optional',
        store_id: 'required',
        parent_id: 'required',
        type: 'required'
    }, null, function (error, body) {
        if (error) {
            callback({status: 0, msg: error});
        } else {
            redisFetch(req, 'categoryList_' + body.parent_id, 'categoryList', function (error, result, res) {
                if (result) {
                    callback({status: 1, msg: result.body.url, isRedis: res});
                } else {
                    API(req, body, '/category/categorylist/', function (status, response, msg) {
                        if (status == 0) {
                            callback({status: 0, msg: response});
                        } else {
                            redisSet('categoryList_' + body.parent_id, {
                                'id': body.parent_id,
                                "body": response,
                                "type": body.type
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