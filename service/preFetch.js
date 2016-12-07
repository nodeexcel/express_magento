imports('config/index');
var CronJob = require('cron').CronJob;
var moment = require('moment');
var jstz = require('jstz');
var timezone = jstz.determine().name();
require('./category');
require('./home');
var _ = require('lodash');
var async = require('async');

fetchCategoryList = function (prefetchDataDB, cb) {
    var count = 0, count1 = 0;
    console.log('category list chla rha h');
    prefetchDataDB.findOne({
        cache: 0
    }, function (error, result) {
        if (error) {
            console.log(error);
        } else if (!result) {
            console.log('result nahi hai');
            var req = {headers: {app_id: config.APP_ID},
                body: {store_id: '1', parent_id: '1', type: 'full'},
                URL: config.URL
            };
            categoryList(req, function (body) {
                if (body.status == 0) {
                    console.log('error');
                } else {
                    console.log('else');
                    var allData = body.msg.children[0].children;
                    var reverseAllData = _.reverse(allData);

                    async.eachOfLimit(reverseAllData, 10, processRecord, function (err) {
                        if (err) {
                            console.log('async eachOfLimt error');
                        } else {
                            console.log('async eachOfLimt function working...!!');
                            console.log('first cb when record nhi hai');
                            cb();
                        }
                    });

                    function processRecord(item, key, callback) {
                        var allRecords = new prefetchDataDB({cache: 0, key: item.id,
                            name: item.name, type: 'category', reqType: 'Category List',
                            req: req});
                        allRecords.save(function (err) {
                            if (err) {
                                console.log('not saved');
                            } else {
                                count++;
                                console.log('count');
                                console.log(count + ":::" + reverseAllData.length);
                                if (count == reverseAllData.length) {
                                    console.log('callback chal gya hai');
                                    callback();
                                }
                            }
                        });
                    }

//                    _.forEach(reverseAllData, function (value) {
//                        var allRecords = new prefetchDataDB({cache: 0, key: value.id,
//                            categoryName: value.name, type: 'category', reqType: 'Category List',
//                            req: req});
//                        allRecords.save(function (err) {
//                            if (err) {
//                                console.log('not saved');
//                            } else {
//                                console.log('saved');
//                            }
//                        });
//                    });



                }
            });
        } else {
            console.log('result hai');
            var type = result.get('type');
            if (type == 'category') {
                var inputId = result.get('key');
                var myReq = {headers: {app_id: config.APP_ID},
                    body: {id: inputId, limit: '10', mobile_width: '300', pageno: '1'},
                    URL: config.URL
                };
                categoryProducts(myReq, function (body) {
                    if (body.status == 0) {
                        console.log('error');
                    } else {
                        var allData = body.msg;
                        console.log(allData.length + ' All Data Length');
                        async.eachOfLimit(allData, 10, processRecord, function (err) {
                            if (err) {
                                console.log('async eachOfLimt error');
                            } else {
                                console.log('async eachOfLimt function working for Category Products...!!');
                                console.log('second cb when record hai');
                                cb();

                            }
                        });

                        function processRecord(item, key, callback) {
                            var row = item.data;
                            var allRecords = new prefetchDataDB({cache: 0, key: row.sku,
                                name: row.name, type: 'product', reqType: 'Category List',
                                req: myReq});
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
                                        } else {
                                            console.log('my error');
                                            count1++;
                                            console.log('count1');
                                            console.log(count1 + ":::" + allData.length);
                                            if (count1 == allData.length) {
                                                callback();
                                            }
                                        }
                                    });
                                }
                            });
                        }

//                        _.forEach(allData, function (value) {
//                            var row = value.data;
//                            var allRecords = new prefetchDataDB({cache: 0, key: row.sku,
//                                name: row.name, type: 'product', reqType: 'Category List',
//                                req: myReq});
//                            allRecords.save(function (err) {
//                                if (err) {
//                                    console.log('not saved');
//                                } else {
//                                    prefetchDataDB.update({
//                                        'key': inputId
//                                    }, {
//                                        $set: {
//                                            cache: 1
//                                        }
//                                    }, function (err) {
//                                        if (!err) {
//                                            console.log('Update Done');
//                                        } else {
//                                            console.log('my error');
//                                        }
//                                    });
//                                }
//                            });
//                        });

                    }
                });
            } else if (type == 'product') {
                console.log('products hai');
                var inputId = result.get('key');
                var myReq = {headers: {app_id: config.APP_ID},
                    body: {sku: inputId, mobile_width: '300'},
                    URL: config.URL
                };
                productGet(myReq, function (body) {
                    if (body.status == 0) {
                        console.log('error');
                    } else {
                        console.log('Product Get Done');
                        var productReq = {headers: {app_id: config.APP_ID},
                            body: {sku: inputId, mobile_width: '300', pageno: 1},
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
                                        console.log('cb chala for product review');
                                        cb();
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
    });
};

fetchHomeSliderList = function (prefetchDataDB) {
    prefetchDataDB.findOne({
        cache: 0
    }, function (error, result) {
        if (error) {
            console.log(error);
        } else if (!result) {
            var req = {headers: {app_id: config.APP_ID},
                body: {mobile_width: '300'},
                URL: config.URL
            };
            homeSlider(req, function (body) {
                if (body.status == 0) {
                } else {
                    var allData = body.msg;
                    _.forEach(allData, function (value) {
                        var allRecords = new prefetchDataDB({cache: 0, URL: value,
                            type: 'Home Slider', reqType: 'Home Slider',
                            req: req});
                        allRecords.save(function (err) {
                            if (err) {
                                console.log('not saved');
                            } else {
                                console.log('saved');
                            }
                        });
                    });
                }
            });
        } else {
            var urlId = result.get('_id');
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
                }
            });
        }
    });
};

fetchhomeProductList = function (prefetchDataDB) {
    prefetchDataDB.findOne({
        cache: 0
    }, function (error, result) {
        if (error) {
            console.log(error);
        } else if (!result) {
            var req = {headers: {app_id: config.APP_ID},
                body: {mobile_width: '300'},
                URL: config.URL
            };
            homeProducts(req, function (body) {
                if (body.status == 0) {
                } else {
                    var allData = body.msg;
                    var reverseAllData = _.reverse(allData);
                    _.forEach(reverseAllData, function (value) {
                        var allRecords = new prefetchDataDB({cache: 0, key: value.data.sku,
                            name: value.data.name, type: 'product', reqType: 'Home Products',
                            req: req});
                        allRecords.save(function (err) {
                            if (err) {
                                console.log('not saved');
                            } else {
                                console.log('saved');
                            }
                        });
                    });
                }
            });
        } else {
            var type = result.get('type');
            if (type == 'product') {
                var inputId = result.get('key');
                var myReq = {headers: {app_id: config.APP_ID},
                    body: {sku: inputId, mobile_width: '300'},
                    URL: config.URL
                };
                productGet(myReq, function (body) {
                    if (body.status == 0) {
                        console.log('error');
                    } else {
                        console.log('Product Get Done');
                        var productReq = {headers: {app_id: config.APP_ID},
                            body: {sku: inputId, mobile_width: '300', pageno: 1},
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
    });
};