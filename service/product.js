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
            redisFetch(req, 'product_', body.parent_id, null, function (result) {
                if (result.status == 0) {
                    callback({status: 0, msg: result.body});
                } else if (result.status == 1) {
                    staticsticAPIDB.findOne({
                        nameAPI: 'productGet'
                    }, function (error, row) {
                        if (error) {
                            callback({status: 1, msg: result.body});
                        } else if (row) {
                            var totalAPI = row.totalAPI;
                            var redisAPI = row.redisAPI;
                            var magentoAPI = row.magentoAPI;
                            staticsticAPIDB.update({
                                nameAPI: 'productGet'
                            }, {
                                $set: {
                                    totalAPI: totalAPI + 1,
                                    redisAPI: redisAPI + 1,
                                    magentoAPI: magentoAPI
                                }
                            }, function (err) {
                                if (!err) {
                                    console.log('Home Slider Updated Done with cache 1. Line-52 File-/service/productjs');
                                    callback({status: 1, msg: result.body});
                                } else {
                                    console.log('Error. Line-55 File-/service/productjs' + err);
                                    callback({status: 1, msg: result.body});
                                }
                            });
                        } else {
                            var record = new staticsticAPIDB({
                                nameAPI: 'productGet',
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
                                        redisSet('product_' + body.sku, {
                                            'id': body.sku,
                                            "body": JSON.stringify(response)
                                        }, function () {
                                            staticsticAPIDB.findOne({
                                                nameAPI: 'productGet'
                                            }, function (error, row) {
                                                if (error) {
                                                    callback({status: status, msg: response});
                                                } else if (row) {
                                                    var totalAPI = row.totalAPI;
                                                    var redisAPI = row.redisAPI;
                                                    var magentoAPI = row.magentoAPI;
                                                    staticsticAPIDB.update({
                                                        nameAPI: 'productGet'
                                                    }, {
                                                        $set: {
                                                            totalAPI: totalAPI + 1,
                                                            redisAPI: redisAPI,
                                                            magentoAPI: magentoAPI + 1
                                                        }
                                                    }, function (err) {
                                                        if (!err) {
                                                            console.log('Home Products Updated Done with cache 1. Line-113 File-/service/productjs');
                                                            callback({status: status, msg: response});
                                                        } else {
                                                            console.log('Error. Line-116 File-/service/productjs' + err);
                                                            callback({status: status, msg: response});
                                                        }
                                                    });
                                                } else {
                                                    var record = new staticsticAPIDB({
                                                        nameAPI: 'productGet',
                                                        totalAPI: 1,
                                                        redisAPI: 0,
                                                        magentoAPI: 1
                                                    });
                                                    record.save(function (err) {
                                                        if (err) {
                                                            callback({status: status, msg: response});
                                                        } else {
                                                            callback({status: status, msg: response});
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
                            function processData(image_url, key, callback) {
                                resize(image_url, APP_ID, body.mobile_width, function (status, image_name) {
                                    if (status == "200") {
                                        minify(image_name, APP_ID, body.mobile_width, function (status, minify_image) {
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

productReview = function (req, callback) {
    validate(req, {
        sku: 'required',
        secret: 'optional',
        mobile_width: 'required',
    }, null, function (body) {
        if (body.status == 0) {
            callback({status: 0, msg: body.body});
        } else {
            redisFetch(req, 'product_', body.parent_id, null, function (result) {
                if (result.status == 0) {
                    callback({status: 0, msg: result.body});
                } else if (result.status == 1) {
                    staticsticAPIDB.findOne({
                        nameAPI: 'productReview'
                    }, function (error, row) {
                        if (error) {
                            callback({status: 1, msg: result.body});
                        } else if (row) {
                            var totalAPI = row.totalAPI;
                            var redisAPI = row.redisAPI;
                            var magentoAPI = row.magentoAPI;
                            staticsticAPIDB.update({
                                nameAPI: 'productReview'
                            }, {
                                $set: {
                                    totalAPI: totalAPI + 1,
                                    redisAPI: redisAPI + 1,
                                    magentoAPI: magentoAPI
                                }
                            }, function (err) {
                                if (!err) {
                                    console.log('Home Slider Updated Done with cache 1. Line-197 File-/service/productjs');
                                    callback({status: 1, msg: result.body});
                                } else {
                                    console.log('Error. Line-200 File-/service/productjs' + err);
                                    callback({status: 1, msg: result.body});
                                }
                            });
                        } else {
                            var record = new staticsticAPIDB({
                                nameAPI: 'productReview',
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
                    API(req, body, '/product/review/', function (status, response, msg) {
                        if (status == 0) {
                            callback({status: 0, msg: response});
                        } else {
                            redisSet('product_' + body.sku, {
                                'id': body.sku,
                                "body": JSON.stringify(response)
                            }, function () {
                                staticsticAPIDB.findOne({
                                    nameAPI: 'productReview'
                                }, function (error, row) {
                                    if (error) {
                                        callback({status: status, msg: response});
                                    } else if (row) {
                                        var totalAPI = row.totalAPI;
                                        var redisAPI = row.redisAPI;
                                        var magentoAPI = row.magentoAPI;
                                        staticsticAPIDB.update({
                                            nameAPI: 'productReview'
                                        }, {
                                            $set: {
                                                totalAPI: totalAPI + 1,
                                                redisAPI: redisAPI,
                                                magentoAPI: magentoAPI + 1
                                            }
                                        }, function (err) {
                                            if (!err) {
                                                console.log('Home Products Updated Done with cache 1. Line-248 File-/service/productjs');
                                                callback({status: status, msg: response});
                                            } else {
                                                console.log('Error. Line-251 File-/service/productjs' + err);
                                                callback({status: status, msg: response});
                                            }
                                        });
                                    } else {
                                        var record = new staticsticAPIDB({
                                            nameAPI: 'productReview',
                                            totalAPI: 1,
                                            redisAPI: 0,
                                            magentoAPI: 1
                                        });
                                        record.save(function (err) {
                                            if (err) {
                                                callback({status: status, msg: response});
                                            } else {
                                                callback({status: status, msg: response});
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
                        staticsticAPIDB.findOne({
                            nameAPI: 'productGetRating'
                        }, function (error, row) {
                            if (error) {
                                callback({status: 1, msg: result.body});
                            } else if (row) {
                                var totalAPI = row.totalAPI;
                                var redisAPI = row.redisAPI;
                                var magentoAPI = row.magentoAPI;
                                staticsticAPIDB.update({
                                    nameAPI: 'productGetRating'
                                }, {
                                    $set: {
                                        totalAPI: totalAPI + 1,
                                        redisAPI: redisAPI + 1,
                                        magentoAPI: magentoAPI
                                    }
                                }, function (err) {
                                    if (!err) {
                                        console.log('Home Slider Updated Done with cache 1. Line-309 File-/service/productjs');
                                        callback({status: 1, msg: result.body});
                                    } else {
                                        console.log('Error. Line-312 File-/service/productjs' + err);
                                        callback({status: 1, msg: result.body});
                                    }
                                });
                            } else {
                                var record = new staticsticAPIDB({
                                    nameAPI: 'productGetRating',
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
                        API(req, body, '/product/getrating/', function (status, response, msg) {
                            if (status == 0) {
                                callback({status: 0, msg: response});
                            } else {
                                redisSet('product_', {
                                    "body": JSON.stringify(response)
                                }, function () {
                                    staticsticAPIDB.findOne({
                                        nameAPI: 'productGetRating'
                                    }, function (error, row) {
                                        if (error) {
                                            callback({status: status, msg: response});
                                        } else if (row) {
                                            var totalAPI = row.totalAPI;
                                            var redisAPI = row.redisAPI;
                                            var magentoAPI = row.magentoAPI;
                                            staticsticAPIDB.update({
                                                nameAPI: 'productGetRating'
                                            }, {
                                                $set: {
                                                    totalAPI: totalAPI + 1,
                                                    redisAPI: redisAPI,
                                                    magentoAPI: magentoAPI + 1
                                                }
                                            }, function (err) {
                                                if (!err) {
                                                    console.log('Home Products Updated Done with cache 1. Line-359 File-/service/productjs');
                                                    callback({status: status, msg: response});
                                                } else {
                                                    console.log('Error. Line-362 File-/service/productjs' + err);
                                                    callback({status: status, msg: response});
                                                }
                                            });
                                        } else {
                                            var record = new staticsticAPIDB({
                                                nameAPI: 'productGetRating',
                                                totalAPI: 1,
                                                redisAPI: 0,
                                                magentoAPI: 1
                                            });
                                            record.save(function (err) {
                                                if (err) {
                                                    callback({status: status, msg: response});
                                                } else {
                                                    callback({status: status, msg: response});
                                                }
                                            });
                                        }
                                    });
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