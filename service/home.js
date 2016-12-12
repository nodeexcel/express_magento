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
var redis = require("redis"),
        client = redis.createClient();
var mongoose = require('mongoose');
var conn = mongoose.connection;
var Grid = require('gridfs-stream');
Grid.mongo = mongoose.mongo;
var staticsticAPIDB = conn.model('staticsticAPI', staticsticAPI);

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
            redisFetch(req, 'products_', null, body.type, function (result) {
                if (result.status == 0) {
                    callback({status: 0, msg: result.body});
                } else if (result.status == 1) {
                    staticsticAPIDB.findOne({
                        nameAPI: 'homeProducts'
                    }, function (error, row) {
                        if (error) {
                            callback({status: 1, msg: result.body});
                        } else if (row) {
                            var totalAPI = row.totalAPI;
                            var redisAPI = row.redisAPI;
                            var magentoAPI = row.magentoAPI;
                            staticsticAPIDB.update({
                                nameAPI: 'homeProducts'
                            }, {
                                $set: {
                                    totalAPI: totalAPI + 1,
                                    redisAPI: redisAPI + 1,
                                    magentoAPI: magentoAPI
                                }
                            }, function (err) {
                                if (!err) {
                                    console.log('Home Products Updated Done with cache 1. Line-55 File-/service/homejs');
                                    callback({status: 1, msg: result.body});
                                } else {
                                    console.log('Error. Line-58 File-/service/homejs' + err);
                                    callback({status: 1, msg: result.body});
                                }
                            });
                        } else {
                            var record = new staticsticAPIDB({
                                nameAPI: 'homeProducts',
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
                                            staticsticAPIDB.findOne({
                                                nameAPI: 'homeProducts'
                                            }, function (error, row) {
                                                if (error) {
                                                    callback({status: status, msg: optmized_response});
                                                } else if (row) {
                                                    var totalAPI = row.totalAPI;
                                                    var redisAPI = row.redisAPI;
                                                    var magentoAPI = row.magentoAPI;
                                                    staticsticAPIDB.update({
                                                        nameAPI: 'homeProducts'
                                                    }, {
                                                        $set: {
                                                            totalAPI: totalAPI + 1,
                                                            redisAPI: redisAPI,
                                                            magentoAPI: magentoAPI + 1
                                                        }
                                                    }, function (err) {
                                                        if (!err) {
                                                            console.log('Home Products Updated Done with cache 1. Line-113 File-/service/homejs');
                                                            callback({status: status, msg: optmized_response});
                                                        } else {
                                                            console.log('Error. Line-115 File-/service/homejs' + err);
                                                            callback({status: status, msg: optmized_response});
                                                        }
                                                    });
                                                } else {
                                                    var record = new staticsticAPIDB({
                                                        nameAPI: 'homeProducts',
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

//FOR GET HOME SLIDER URL LIST
homeSlider = function (req, callback) {
    var APP_ID = req.headers.app_id;
    validate(req, {
        mobile_width: 'required'
    }, null, function (body) {
        if (body.status == 0) {
            callback({status: 0, msg: body.body});
        } else {
            redisFetch(req, 'slider', null, null, function (result) {
                if (result.status == 0) {
                    callback({status: 0, msg: result.body});
                } else if (result.status == 1) {
                    staticsticAPIDB.findOne({
                        nameAPI: 'homeSlider'
                    }, function (error, row) {
                        if (error) {
                            callback({status: 1, msg: result.body});
                        } else if (row) {
                            var totalAPI = row.totalAPI;
                            var redisAPI = row.redisAPI;
                            var magentoAPI = row.magentoAPI;
                            staticsticAPIDB.update({
                                nameAPI: 'homeSlider'
                            }, {
                                $set: {
                                    totalAPI: totalAPI + 1,
                                    redisAPI: redisAPI + 1,
                                    magentoAPI: magentoAPI
                                }
                            }, function (err) {
                                if (!err) {
                                    console.log('Home Slider Updated Done with cache 1. Line-228 File-/service/homejs');
                                    callback({status: 1, msg: result.body});
                                } else {
                                    console.log('Error. Line-231 File-/service/homejs' + err);
                                    callback({status: 1, msg: result.body});
                                }
                            });
                        } else {
                            var record = new staticsticAPIDB({
                                nameAPI: 'homeSlider',
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
                                        staticsticAPIDB.findOne({
                                            nameAPI: 'homeSlider'
                                        }, function (error, row) {
                                            if (error) {
                                                callback({status: status, msg: optmized_response});
                                            } else if (row) {
                                                var totalAPI = row.totalAPI;
                                                var redisAPI = row.redisAPI;
                                                var magentoAPI = row.magentoAPI;
                                                staticsticAPIDB.update({
                                                    nameAPI: 'homeSlider'
                                                }, {
                                                    $set: {
                                                        totalAPI: totalAPI + 1,
                                                        redisAPI: redisAPI,
                                                        magentoAPI: magentoAPI + 1
                                                    }
                                                }, function (err) {
                                                    if (!err) {
                                                        console.log('Home Slider Updated Done with cache 1. Line-288 File-/service/homejs');
                                                        callback({status: status, msg: optmized_response});
                                                    } else {
                                                        console.log('Error. Line-291 File-/service/homejs' + err);
                                                        callback({status: status, msg: optmized_response});
                                                    }
                                                });
                                            } else {
                                                var record = new staticsticAPIDB({
                                                    nameAPI: 'homeSlider',
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