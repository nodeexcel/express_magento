imports('config/index');
var CronJob = require('cron').CronJob;
var moment = require('moment');
var jstz = require('jstz');
var timezone = jstz.determine().name();
require('./category');
require('./home');
var _ = require('lodash');
var async = require('async');

fetchCategoryList = function (prefetchDataDB, APP_ID, cb) {
    prefetchDataDB.find({
        cache: 0,
        APP_ID: APP_ID
    }).limit(10).exec(function (error, result) {
        if (error) {
            console.log(error);
        } else if (!result || result.length == 0) {
            var req = {
                headers: {
                    app_id: APP_ID
                },
                body: {
                    store_id: '1',
                    parent_id: '1',
                    type: 'full'
                },
                URL: config.URL
            };
            categoryList(req, function (body) {
                if (body.status == 0) {
                    console.log('error');
                } else {
                    var allData = body.msg.children[0].children;
                    var reverseAllData = _.reverse(allData);
                    async.eachOfLimit(reverseAllData, 10, processCategoryList, function (err) {
                        if (err) {
                            console.log('async eachOfLimt error');
                        } else {
                            console.log('async eachOfLimt function working for Category List(Record Empty)...!!');
                            cb();
                        }
                    });
                    function processCategoryList(item, key, callback) {
                        var allRecords = new prefetchDataDB({
                            cache: 0,
                            key: item.id,
                            name: item.name,
                            type: 'category',
                            reqType: 'Category List',
                            req: req,
                            APP_ID: APP_ID
                        });
                        allRecords.save(function (err) {
                            if (err) {
                                console.log('not saved');
                            } else {
                                callback();
                            }
                        });
                    }
                }
            });
        } else {
            async.eachOfLimit(result, 10, processCategoryListRecord, function (err) {
                if (err) {
                    console.log('async eachOfLimt error');
                } else {
                    console.log('async eachOfLimt function working for Category List(Record Available)...!!');
                    cb();
                }
            });
            function processCategoryListRecord(item, key, callback) {
                if (item.type == 'category') {
                    var inputId = item.key;
                    var myReq = {
                        headers: {
                            app_id: APP_ID
                        },
                        body: {
                            id: inputId,
                            limit: '10',
                            mobile_width: '300',
                            pageno: '1'
                        },
                        URL: config.URL
                    };
                    categoryProducts(myReq, function (body) {
                        if (body.status == 0) {
                            console.log('error');
                        } else {
                            var allData = body.msg;
                            async.eachOfLimit(allData, 10, processCategoryProducts, function (err) {
                                if (err) {
                                    console.log('async eachOfLimt error');
                                } else {
                                    console.log('async eachOfLimt function working for Category Products...!!');
                                    callback();
                                }
                            });
                            function processCategoryProducts(item, key, callback) {
                                var row = item.data;
                                var allRecords = new prefetchDataDB({
                                    cache: 0,
                                    key: row.sku,
                                    name: row.name,
                                    type: 'product',
                                    reqType: 'Category List',
                                    req: myReq,
                                    APP_ID: APP_ID
                                });
                                allRecords.save(function (err) {
                                    if (err) {
                                        console.log('not saved');
                                    } else {
                                        prefetchDataDB.update({
                                            'key': inputId
                                        }, {
                                            $set: {
                                                cache: 1
                                            }
                                        }, function (err) {
                                            if (!err) {
                                                console.log('Update Done');
                                                callback();
                                            } else {
                                                console.log('my error');
                                            }
                                        });
                                    }
                                });
                            }
                        }
                    });
                } else if (item.type == 'product') {
                    var inputId = item.key;
                    var myReq = {
                        headers: {
                            app_id: config.APP_ID
                        },
                        body: {
                            sku: inputId,
                            mobile_width: '300'
                        },
                        URL: config.URL
                    };
                    productGet(myReq, function (body) {
                        if (body.status == 0) {
                            console.log('error');
                        } else {
                            console.log('Product Get Done');
                            var productReq = {
                                headers: {
                                    app_id: config.APP_ID
                                },
                                body: {
                                    sku: inputId,
                                    mobile_width: '300',
                                    pageno: 1
                                },
                                URL: config.URL
                            };
                            productReview(productReq, function (productBody) {
                                if (productBody.status == 0) {
                                    console.log('error');
                                } else {
                                    prefetchDataDB.update({
                                        'key': inputId
                                    }, {
                                        $set: {
                                            cache: 1
                                        }
                                    }, function (err) {
                                        if (!err) {
                                            console.log('Product Review get done.');
//                                            cb();
                                            callback();
                                        } else {
                                            console.log('my error');
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            }
        }
    });
};

fetchHomeSliderList = function (prefetchDataDB, APP_ID, cb) {
    prefetchDataDB.find({
        cache: 0,
        APP_ID: APP_ID
    }).limit(10).exec(function (error, result) {
        if (error) {
            console.log(error);
        } else if (!result || result.length == 0) {
            var req = {
                headers: {
                    app_id: APP_ID
                },
                body: {
                    mobile_width: '300'
                },
                URL: config.URL
            };
            homeSlider(req, function (body) {
                if (body.status == 0) {
                } else {
                    var allData = body.msg;
                    async.eachOfLimit(allData, 10, processHomeSlider, function (err) {
                        if (err) {
                            console.log('async eachOfLimt error');
                        } else {
                            console.log('async eachOfLimt function working for Home Slider(Record Empty)...!!');
                            cb();
                        }
                    });
                    function processHomeSlider(item, key, callback) {
                        var allRecords = new prefetchDataDB({
                            cache: 0,
                            key: item,
                            type: 'Home Slider',
                            reqType: 'Home Slider',
                            name: item,
                            req: req,
                            APP_ID: APP_ID
                        });
                        allRecords.save(function (err) {
                            if (err) {
                                console.log('not saved');
                            } else {
                                console.log('saved');
                                callback();
                            }
                        });
                    }
                }
            });
        } else {
            async.eachOfLimit(result, 10, processHomeSliderRecord, function (err) {
                if (err) {
                    console.log('async eachOfLimt error');
                } else {
                    console.log('async eachOfLimt function working for Home Slider(Record)...!!');
                    cb();
                }
            });
            function processHomeSliderRecord(item, key, callback) {
                var urlId = item._id;
                prefetchDataDB.update({
                    _id: urlId
                }, {
                    $set: {
                        cache: 1
                    }
                }, function (err) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log('Home Slider cache 1 Done!!');
                        callback();
                    }
                });
            }
        }
    });
};

fetchhomeProductList = function (prefetchDataDB, APP_ID, cb) {
    prefetchDataDB.find({
        cache: 0,
        APP_ID: APP_ID
    }).limit(10).exec(function (error, result) {
        if (error) {
            console.log(error);
        } else if (!result || result.length == 0) {
            var req = {
                headers: {
                    app_id: APP_ID
                },
                body: {
                    mobile_width: '300'
                },
                URL: config.URL
            };
            homeProducts(req, function (body) {
                if (body.status == 0) {
                } else {
                    var allData = body.msg;
                    var reverseAllData = _.reverse(allData);
                    async.eachOfLimit(reverseAllData, 10, processHomeProducts, function (err) {
                        if (err) {
                            console.log('async eachOfLimt error');
                        } else {
                            console.log('async eachOfLimt function working for Home Products...!!');
                            cb();
                        }
                    });
                    function processHomeProducts(item, key, callback) {
                        var allRecords = new prefetchDataDB({
                            cache: 0,
                            key: item.data.sku,
                            name: item.data.name,
                            type: 'product',
                            reqType: 'Home Products',
                            req: req,
                            APP_ID: APP_ID
                        });
                        allRecords.save(function (err) {
                            if (err) {
                                console.log('not saved');
                            } else {
                                console.log('saved');
                                callback();
                            }
                        });
                    }
                }
            });
        } else {
            async.eachOfLimit(result, 10, processHomeProductsRecord, function (err) {
                if (err) {
                    console.log('async eachOfLimt error');
                } else {
                    console.log('async eachOfLimt function working for Home Products(Record)...!!');
                    cb();
                }
            });
            function processHomeProductsRecord(item, key, callback) {
                var type = item.type;
                if (type == 'product') {
                    var inputId = item.key;
                    var myReq = {
                        headers: {
                            app_id: APP_ID
                        },
                        body: {
                            sku: inputId,
                            mobile_width: '300'
                        },
                        URL: config.URL
                    };
                    productGet(myReq, function (body) {
                        if (body.status == 0) {
                            console.log('error');
                        } else {
                            console.log('Product Get Done');
                            var productReq = {
                                headers: {
                                    app_id: APP_ID
                                },
                                body: {
                                    sku: inputId,
                                    mobile_width: '300',
                                    pageno: 1
                                },
                                URL: config.URL
                            };
                            productReview(productReq, function (productBody) {
                                if (productBody.status == 0) {
                                    console.log('error');
                                } else {
                                    prefetchDataDB.update({
                                        'key': inputId
                                    }, {
                                        $set: {
                                            cache: 1
                                        }
                                    }, function (err) {
                                        if (!err) {
                                            console.log('Product Review get done.');
                                            callback();
                                        } else {
                                            console.log('my error');
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            }
        }
    });
};

fetchProductReview = function (productReq, prefetchDataDB, APP_ID, cb) {
    prefetchDataDB.find({
        cache: 0,
        APP_ID: APP_ID
    }).limit(10).exec(function (error, result) {
        if (error) {
            console.log(error);
        } else if (result || result.length > 0) {
            async.eachOfLimit(result, 10, processCategoryListRecord, function (err) {
                if (err) {
                    console.log('async eachOfLimt error');
                } else {
                    console.log('async eachOfLimt function working for Product Review(Record)...!!');
                    cb();
                }
            });
            function processCategoryListRecord(item, key, callback) {
                if (item.type == 'product') {
                    var inputId = item.key;
//                    var productReq = {
//                        headers: {
//                            app_id: config.APP_ID
//                        },
//                        body: {
//                            sku: inputId,
//                            mobile_width: '300',
//                            pageno: 1
//                        },
//                        URL: config.URL
//                    };
                    productReview(productReq, function (productBody) {
                        if (productBody.status == 0) {
                            console.log('error');
                        } else {
                            prefetchDataDB.update({
                                'key': inputId
                            }, {
                                $set: {
                                    cache: 1
                                }
                            }, function (err) {
                                if (!err) {
                                    console.log('Product Review get done.');
//                                            cb();
                                    callback();
                                } else {
                                    console.log('my error');
                                }
                            });
                        }
                    });
                }
            }
        }
    });
};