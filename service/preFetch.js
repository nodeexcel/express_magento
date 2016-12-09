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
            console.log('category list API failed. Line-27 File-/service/preFetchjs');
            cb();
        } else {
            var allData = body.msg.children[0].children;
            var allCategory = getAllCategory(allData);
            async.eachOfLimit(allCategory, 10, processCategoryList, function (err) {
                if (err) {
                    console.log('async eachOfLimt error. Line-34 File-/service/preFetchjs' + err);
                    cb();
                } else {
                    console.log('async eachOfLimt function working for Category List(Record Empty). Line-37 File-/service/preFetchjs');
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
                        console.log('category not saved. Line-54 File-/service/preFetchjs' + err);
                        callback();
                    } else {
                        callback();
                    }
                });
            }
        }
    });
};

fetchHomeSliderList = function (prefetchDataDB, APP_ID, URL, cb) {
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
};

fetchhomeProductList = function (prefetchDataDB, APP_ID, URL, cb) {
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
                    console.log('async eachOfLimt error. Line-102 File-/service/preFetchjs' + err);
                    cb();
                } else {
                    console.log('async eachOfLimt function working for Home Products. Line-105 File-/service/preFetchjs');
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
                        console.log('Error. Line-121 File-/service/preFetchjs' + err);
                        callback();
                    } else {
                        console.log('home product saved. Line-124 File-/service/preFetchjs');
                        callback();
                    }
                });
            }
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
            console.log('Fetch Category Error! Line-161 File-/service/preFetchjs' + error);
            cb();
        } else if (result || result.length > 0) {
            async.eachOfLimit(result, 10, processCategoryListRecord, function (err) {
                if (err) {
                    console.log('async eachOfLimt error. Line-166 File-/service/preFetchjs' + err);
                    cb();
                } else {
                    console.log('async eachOfLimt function working for Category List(Record Available). Line-169 File-/service/preFetchjs');
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
                        console.log('category products not found. Line-190 File-/service/preFetchjs');
                        callback();
                    } else {
                        var allData = body.msg;
                        if (allData.length > 0) {
                            async.eachOfLimit(allData, 10, processCategoryProducts, function (err) {
                                if (err) {
                                    console.log('async eachOfLimt error. Line-197 File-/service/preFetchjs' + err);
                                    callback();
                                } else {
                                    console.log('async eachOfLimt function working for Category Products. Line-200 File-/service/preFetchjs');
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
                                allRecords.save(function (err) {
                                    if (err) {
                                        console.log('product not saved. Line-218 File-/service/preFetchjs' + err);
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
                                                console.log('Page No. Update Done. Line-231 File-/service/preFetchjs' + myPage);
                                                callback();
                                            } else {
                                                console.log('Error. Line-234 File-/service/preFetchjs' + err);
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
                                    console.log('Category Updated Done with cache 1. Line-251 File-/service/preFetchjs');
                                    callback();
                                } else {
                                    console.log('Error. Line-254 File-/service/preFetchjs' + err);
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
            console.log('PREFETCH PRODUCT FAILED. Line-273 File-/service/preFetchjs' + error);
            cb();
        } else if (result || result.length > 0) {
            async.eachOfLimit(result, 10, processProduct, function (err) {
                if (err) {
                    console.log('async eachOfLimt error. Line-278 File-/service/preFetchjs' + err);
                    cb();
                } else {
                    console.log('async eachOfLimt function working for Products(Record Empty). Line-281 File-/service/preFetchjs');
                    cb();
                }
            });
            function processProduct(item, key, callback) {
                var inputId = item.key;
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
                        console.log('product get not found. Line-299 File-/service/preFetchjs');
                        callback();
                    } else {
                        console.log('Product Get Done. Line-302 File-/service/preFetchjs');
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
                                console.log('product review not found. Line-315 File-/service/preFetchjs');
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
                                        console.log('Product Review get done, update cache 1. Line-326 File-/service/preFetchjs');
                                        callback();
                                    } else {
                                        console.log('Product Review not done. Line-329 File-/service/preFetchjs' + err);
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