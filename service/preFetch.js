imports('config/index');
imports('config/constant')
var CronJob = require('cron').CronJob;
var moment = require('moment');
var jstz = require('jstz');
var timezone = jstz.determine().name();
var _ = require('lodash');
var async = require('async');
require('./category');
require('./home');
require('./web');

fetchCategoryList = function (prefetchDataDB, APP_ID, URL, storeId, cb) {
    prefetchDataDB.find({
        cache: 0,
        APP_ID: APP_ID,
        type: PREFETCHCATEGORY
    }).limit(10).exec(function (error, result) {
        if (error) {
            console.log(error);
            cb();
        } else if (!result || result.length == 0) {
            var req = {
                headers: {
                    app_id: APP_ID
                },
                body: {
                    store_id: storeId,
                    parent_id: '1',
                    type: 'full'
                },
                URL: URL
            };
            categoryList(req, function (body) {
                if (body.status == 0) {
                    console.log('category list API failed.');
                    cb();
                } else {
                    var allData = body.msg.children[0].children;
                    var allCategory = getAllCategory(allData);
//                        var reverseAllData = _.reverse(allCategory);
                    async.eachOfLimit(allCategory, 10, processCategoryList, function (err) {
                        if (err) {
                            console.log('async eachOfLimt error' + err);
                            cb();
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
                            type: PREFETCHCATEGORY,
                            reqType: PREFETCHCATEGORY,
                            req: req,
                            APP_ID: APP_ID,
                            pageno: 1
                        });
                        allRecords.save(function (err) {
                            if (err) {
                                console.log('category not saved' + err);
                                callback();
                            } else {
                                callback();
                            }
                        });
                    }
                }
            });
        }
    });
};

fetchHomeSliderList = function (prefetchDataDB, APP_ID, URL, cb) {
    prefetchDataDB.find({
        cache: 0,
        APP_ID: APP_ID
    }).limit(10).exec(function (error) {
        if (error) {
            console.log(error);
            cb();
        } else {
            var req = {
                headers: {
                    app_id: APP_ID
                },
                body: {
                    mobile_width: '300'
                },
                URL: URL
            };
            homeSlider(req, function (body) {
                if (body.status == 0) {
                    cb();
                } else {
                    cb();
                }
            });
        }
    });
};

fetchhomeProductList = function (prefetchDataDB, APP_ID, URL, cb) {
    prefetchDataDB.find({
        cache: 0,
        APP_ID: APP_ID
    }).limit(10).exec(function (error, result) {
        if (error) {
            console.log(error);
            cb();
        } else if (!result || result.length == 0) {
            var req = {
                headers: {
                    app_id: APP_ID
                },
                body: {
                    mobile_width: '300'
                },
                URL: URL
            };
            homeProducts(req, function (body) {
                if (body.status == 0) {
                    cb();
                } else {
                    var allData = body.msg;
                    var reverseAllData = _.reverse(allData);
                    async.eachOfLimit(reverseAllData, 10, processHomeProducts, function (err) {
                        if (err) {
                            console.log('async eachOfLimt error' + err);
                            cb();
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
                            type: PREFETCHPRODUCT,
                            reqType: PREFETCHPRODUCT,
                            req: req,
                            APP_ID: APP_ID
                        });
                        allRecords.save(function (err) {
                            if (err) {
                                console.log(err);
                                callback();
                            } else {
                                console.log('home product saved');
                                callback();
                            }
                        });
                    }
                }
            });
        }
    });
};

fetchWebConfig = function (APP_ID, URL, cb) {
    var req = {
        headers: {
            app_id: APP_ID
        },
        body: {
            secret: 'optional'
        },
        URL: URL
    };
    webConfig(req, function (body) {
        if (body.status == 0) {
            cb({status: 0});
        } else {
            var allData = body.msg;
            cb({status: 1, msg: allData});
        }
    });

};

fetchCategory = function (prefetchDataDB, APP_ID, URL, cb) {
    prefetchDataDB.find({
        cache: 0,
        APP_ID: APP_ID,
        reqType: PREFETCHCATEGORY
    }).limit(10).exec(function (error, result) {
        if (error) {
            console.log('Fetch Category Error!' + error);
            cb();
        } else if (result || result.length > 0) {
            async.eachOfLimit(result, 10, processCategoryListRecord, function (err) {
                if (err) {
                    console.log('async eachOfLimt error' + err);
                    cb();
                } else {
                    console.log('async eachOfLimt function working for Category List(Record Available)...!!');
                    cb();
                }
            });
            function processCategoryListRecord(item, key, callback) {
                var inputId = item.key;
                var inputPage = item.pageno;
                var myReq = {
                    headers: {
                        app_id: APP_ID
                    },
                    body: {
                        id: inputId,
                        limit: '10',
                        mobile_width: '300',
                        pageno: inputPage
                    },
                    URL: URL
                };
                categoryProducts(myReq, function (body) {
                    if (body.status == 0) {
                        console.log('category products not found');
                        callback();
                    } else {
                        var allData = body.msg;
                        if (allData.length > 0) {
                            async.eachOfLimit(allData, 10, processCategoryProducts, function (err) {
                                if (err) {
                                    console.log('async eachOfLimt error' + err);
                                    callback();
                                } else {
                                    console.log('async eachOfLimt function working for Category Products...!!');
                                    callback();
                                }
                            });
                            function processCategoryProducts(item, key, callback) {
                                var row = item.data;
                                var allRecords = new prefetchDataDB({
                                    categoryId: inputId,
                                    cache: 0,
                                    key: row.sku,
                                    name: row.name,
                                    type: PREFETCHPRODUCT,
                                    reqType: PREFETCHPRODUCT,
                                    req: myReq,
                                    APP_ID: APP_ID
                                });
                                allRecords.save(function (err, result) {
                                    if (err) {
                                        console.log('product not saved' + err);
                                    } else {
                                        var page = inputPage;
                                        var myPage = (page * 1) + 1;
                                        prefetchDataDB.update({
                                            'key': inputId,
                                            'type': PREFETCHCATEGORY
                                        }, {
                                            $set: {
                                                pageno: myPage
                                            }
                                        }, function (err) {
                                            if (!err) {
                                                console.log('Page No. Update Done' + myPage);
                                                callback();
                                            } else {
                                                console.log(err);
                                                callback();
                                            }
                                        });
                                    }
                                });
                            }
                        } else {
                            prefetchDataDB.update({
                                'key': inputId,
                                'type': PREFETCHCATEGORY
                            }, {
                                $set: {
                                    cache: 1
                                }
                            }, function (err) {
                                if (!err) {
                                    console.log('Category Updated Done with cache 1');
                                    callback();
                                } else {
                                    console.log(err);
                                    callback();
                                }
                            });
                        }
                    }
                });
            }
        }
    });
};

fetchProduct = function (prefetchDataDB, APP_ID, URL, cb) {
    prefetchDataDB.find({
        cache: 0,
        APP_ID: APP_ID,
        type: PREFETCHPRODUCT
    }).limit(10).exec(function (error, result) {
        if (error) {
            console.log('PREFETCH PRODUCT FAILED.');
            cb();
        } else if (result || result.length > 0) {
            async.eachOfLimit(result, 10, processProduct, function (err) {
                if (err) {
                    console.log('async eachOfLimt error' + err);
                    cb();
                } else {
                    console.log('async eachOfLimt function working for Products(Record Empty)...!!');
                    cb();
                }
            });
            function processProduct(item, key, callback) {
                var inputId = item.key;
                var inputPage = item.pageno;
                var myReq = {
                    headers: {
                        app_id: APP_ID
                    },
                    body: {
                        sku: inputId,
                        mobile_width: '300'
                    },
                    URL: URL
                };
                productGet(myReq, function (body) {
                    if (body.status == 0) {
                        console.log('product get not found');
                        callback();
                    } else {
                        console.log('Product Get Done');
                        var productReq = {
                            headers: {
                                app_id: APP_ID
                            },
                            body: {
                                sku: inputId,
                                mobile_width: '300'
                            },
                            URL: URL
                        };
                        productReview(productReq, function (productBody) {
                            if (productBody.status == 0) {
                                console.log('product review not found');
                                callback();
                            } else {
                                prefetchDataDB.update({
                                    'key': inputId
                                }, {
                                    $set: {
                                        cache: 1
                                    }
                                }, function (err) {
                                    if (!err) {
                                        console.log('Product Review get done, update cache 1');
                                        callback();
                                    } else {
                                        console.log('Product Review not done::' + err);
                                        callback();
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


var arrayCategory = [];
getAllCategory = function (x) {
    if (x) {
        for (var a = 0; a < x.length; a++) {
            var row = x[a];
            arrayCategory.push(row);
            if (row.children) {
                getAllCategory(row.children);
            }
        }
    }
    return arrayCategory;
};