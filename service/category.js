imports('config/index');
imports('config/constant');
require('node-import');
require('./validate');
require('./image');
require('./request');
require('./cache');
require('./responseMsg');
require('../mods/schema');
var express = require('express');
var router = express.Router();
var async = require('async');
var mongoose = require('mongoose');
var conn = mongoose.connection;
var Grid = require('gridfs-stream');
Grid.mongo = mongoose.mongo;
var staticsticAPIDB = conn.model('staticsticAPI', staticsticAPI);

//FOR GET CATEGORY PRODUCTS
categoryProducts = function (req, callback) {
    var APP_ID = req.headers.app_id;
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
        mobile_width: 'required',
        page: 'required'
    }, null, function (body) {
        if (body.status == 0) {
            callback({status: 0, msg: body.body});
        } else {
            redisFetch(req, 'category_', body.id, null, function (result) {
                if (result.status == 0) {
                    callback({status: 0, msg: result.body});
                } else if (result.status == 1) {
                    staticsticAPIDB.findOne({
                        nameAPI: 'categoryProducts'
                    }, function (error, row) {
                        if (error) {
                            callback({status: 1, msg: result.body});
                        } else if (row) {
                            var totalAPI = row.totalAPI;
                            var redisAPI = row.redisAPI;
                            var magentoAPI = row.magentoAPI;
                            staticsticAPIDB.update({
                                nameAPI: 'categoryProducts'
                            }, {
                                $set: {
                                    totalAPI: totalAPI + 1,
                                    redisAPI: redisAPI + 1,
                                    magentoAPI: magentoAPI
                                }
                            }, function (err) {
                                if (!err) {
                                    console.log('Category Updated Done with cache 1. Line-71 File-/service/categoryjs');
                                    callback({status: 1, msg: result.body});
                                } else {
                                    console.log('Error. Line-74 File-/service/categoryjs' + err);
                                    callback({status: 1, msg: result.body});
                                }
                            });
                        } else {
                            var record = new staticsticAPIDB({
                                nameAPI: 'categoryProducts',
                                totalAPI: 1,
                                redisAPI: 1,
                                magentoAPI: 0
                            });
                            record.save(function (err) {
                                if (err) {
                                    callback({status: 1, msg: result.body});
                                } else {
                                    callback({status: 1, msg: result.body});
                                }
                            });
                        }
                    });
                } else {
                    API(req, body, '/category/products/', function (status, response, msg) {
                        if (status == 0) {
                            callback({status: 0, msg: msg});
                        } else {
//                            callback({status: status, msg: response});
                            if (response !== undefined) {
                                var optmized_response = [];
                                async.eachOfLimit(response, 5, processData, function (err) {
                                    if (err) {
                                        callback({status: 0, msg: 'OOPS! How is this possible?'});
                                    } else {
                                        redisSet('category_' + body.id, {
                                            'id': body.id,
                                            "limit": body.limit,
                                            "body": JSON.stringify(optmized_response)
                                        }, function () {
                                            staticsticAPIDB.findOne({
                                                nameAPI: 'categoryProducts'
                                            }, function (error, row) {
                                                if (error) {
                                                    callback({status: status, msg: optmized_response});
                                                } else if (row) {
                                                    var totalAPI = row.totalAPI;
                                                    var redisAPI = row.redisAPI;
                                                    var magentoAPI = row.magentoAPI;
                                                    staticsticAPIDB.update({
                                                        nameAPI: 'categoryProducts'
                                                    }, {
                                                        $set: {
                                                            totalAPI: totalAPI + 1,
                                                            redisAPI: redisAPI,
                                                            magentoAPI: magentoAPI + 1
                                                        }
                                                    }, function (err) {
                                                        if (!err) {
                                                            console.log('Category Updated Done with cache 1. Line-130 File-/service/categoryjs');
                                                            callback({status: status, msg: optmized_response});
                                                        } else {
                                                            console.log('Error. Line-133 File-/service/categoryjs' + err);
                                                            callback({status: status, msg: optmized_response});
                                                        }
                                                    });
                                                } else {
                                                    var record = new staticsticAPIDB({
                                                        nameAPI: 'categoryProducts',
                                                        totalAPI: 1,
                                                        redisAPI: 0,
                                                        magentoAPI: 1
                                                    });
                                                    record.save(function (err) {
                                                        if (err) {
                                                            callback({status: status, msg: optmized_response});
                                                        } else {
                                                            callback({status: status, msg: optmized_response});
                                                        }
                                                    });
                                                }
                                            });
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
                                        })
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
    }, null, function (body) {
        if (body.status == 0) {
            callback({status: 0, msg: body.body});
        } else {
            redisFetch(req, 'category_', body.parent_id, body.type, function (result) {
                if (result.status == 0) {
                    callback({status: 0, msg: result.body});
                } else if (result.status == 1) {
                    staticsticAPIDB.findOne({
                        nameAPI: 'categoryList'
                    }, function (error, row) {
                        if (error) {
                            callback({status: 1, msg: result.body});
                        } else if (row) {
                            var totalAPI = row.totalAPI;
                            var redisAPI = row.redisAPI;
                            var magentoAPI = row.magentoAPI;
                            staticsticAPIDB.update({
                                nameAPI: 'categoryList'
                            }, {
                                $set: {
                                    totalAPI: totalAPI + 1,
                                    redisAPI: redisAPI + 1,
                                    magentoAPI: magentoAPI
                                }
                            }, function (err) {
                                if (!err) {
                                    console.log('Category Updated Done with cache 1. Line-232 File-/service/categoryjs');
                                    callback({status: 1, msg: result.body});
                                } else {
                                    console.log('Error. Line-235 File-/service/categoryjs' + err);
                                    callback({status: 1, msg: result.body});
                                }
                            });
                        } else {
                            var record = new staticsticAPIDB({
                                nameAPI: 'categoryList',
                                totalAPI: 1,
                                redisAPI: 1,
                                magentoAPI: 0
                            });
                            record.save(function (err) {
                                if (err) {
                                    callback({status: 1, msg: result.body});
                                } else {
                                    callback({status: 1, msg: result.body});
                                }
                            });
                        }
                    });
                } else {
                    API(req, body, '/category/categorylist/', function (status, response, msg) {
                        if (status == 0) {
                            callback({status: 0, msg: response});
                        } else {
                            redisSet('category_' + body.parent_id, {
                                'id': body.parent_id,
                                "body": JSON.stringify(response),
                                "type": body.type
                            }, function () {
                                staticsticAPIDB.findOne({
                                    nameAPI: 'categoryList'
                                }, function (error, row) {
                                    if (error) {
                                        callback({status: 1, msg: response});
                                    } else if (row) {
                                        var totalAPI = row.totalAPI;
                                        var redisAPI = row.redisAPI;
                                        var magentoAPI = row.magentoAPI;
                                        staticsticAPIDB.update({
                                            nameAPI: 'categoryList'
                                        }, {
                                            $set: {
                                                totalAPI: totalAPI + 1,
                                                redisAPI: redisAPI,
                                                magentoAPI: magentoAPI + 1
                                            }
                                        }, function (err) {
                                            if (!err) {
                                                console.log('Category Updated Done with cache 1. Line-284 File-/service/categoryjs');
                                                callback({status: 1, msg: response});
                                            } else {
                                                console.log('Error. Line-287 File-/service/categoryjs' + err);
                                                callback({status: 1, msg: response});
                                            }
                                        });
                                    } else {
                                        var record = new staticsticAPIDB({
                                            nameAPI: 'categoryList',
                                            totalAPI: 1,
                                            redisAPI: 0,
                                            magentoAPI: 1
                                        });
                                        record.save(function (err) {
                                            if (err) {
                                                callback({status: 1, msg: response});
                                            } else {
                                                callback({status: 1, msg: response});
                                            }
                                        });
                                    }
                                });
                            });
                        }
                    });
                }
            });
        }
    });
};