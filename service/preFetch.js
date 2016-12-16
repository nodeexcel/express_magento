imports('config/index');
imports('config/constant');
require('./category');
require('./home');
require('./web');
var CronJob = require('cron').CronJob;
var moment = require('moment');
var jstz = require('jstz');
var timezone = jstz.determine().name();
var _ = require('lodash');
var async = require('async');

//FOR GETTING CATEGORY LIST
fetchCategoryList = function (prefetchDataDB, categoriesDB, APP_ID, URL, storeId, cb) {
    var req = {
        headers: {
            app_id: APP_ID
        },
        body: {
            store_id: storeId,
            parent_id: '1',
            type: 'full'
        },
        URL: URL,
        isAdmin: true
    };
    categoryList(req, function (body) {
        if (body.status == 0) {
            console.log('category list API failed. Line-28 File-/service/preFetchjs');
            cb();
        } else {
            var allData = body.msg.children[0].children;
            var allCategory = getAllCategory(allData);
            async.eachOfLimit(allCategory, 10, processCategoryList, function (err) {
                if (err) {
                    console.log('async eachOfLimt error. Line-35 File-/service/preFetchjs' + err);
                    cb();
                } else {
                    console.log('async eachOfLimt function working for Category List(Record Empty). Line-38 File-/service/preFetchjs');
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
                    page: 1
                });
                allRecords.save(function (err) {
                    if (err) {
                        console.log('category not saved. Line-55 File-/service/preFetchjs' + err);
                        callback();
                    } else {
                        categoriesDB.find({
                            "categoryId": item.id,
                            "categoryName": item.name,
                            "APP_ID": APP_ID
                        }, function (error, result) {
                            if (error) {
                                console.log('category not saved. Line-66 File-/service/preFetchjs' + error);
                                callback();
                            } else if (!result || result.length == 0) {
                                var categoryRecord = new categoriesDB({
                                    "date": moment().format('MMMM Do YYYY, h:mm:ss a'),
                                    "categoryId": item.id,
                                    "categoryName": item.name,
                                    "APP_ID": APP_ID,
                                    "json": item
                                });
                                categoryRecord.save(function (errorCat) {
                                    if (errorCat) {
                                        console.log('category not saved. Line-66 File-/service/preFetchjs' + errorCat);
                                        callback();
                                    } else {
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

//FOR GETTING SLIDER LIST
fetchHomeSliderList = function (homeSliderDB, APP_ID, URL, cb) {
    var req = {
        headers: {
            app_id: APP_ID
        },
        body: {
            mobile_width: '300'
        },
        URL: URL,
        isAdmin: true
    };
    homeSlider(req, function (body) {
        if (body.status == 0) {
            cb();
        } else {
            if (body.msg) {
                for (var a = 0; a < body.msg.length; a++) {
                    var row = body.msg[a];
                    homeSliderDB.find({
                        APP_ID: APP_ID,
                        url: row
                    }, function (err, result) {
                        if (err) {
                            console.log('Error. Line-112, File-service.preFetchjs' + err);
                            cb();
                        } else if (!result || result.length == 0) {
                            var record = new homeSliderDB({
                                "date": moment().format('MMMM Do YYYY, h:mm:ss a'),
                                "url": row,
                                "APP_ID": APP_ID
                            });
                            record.save(function (error) {
                                if (error) {
                                    console.log('Error. Line-122, File-preFetchjs');
                                    cb();
                                } else {
                                    if (a == body.msg.length) {
                                        body.msg.length = 0;
                                        cb();
                                    }
                                }
                            });
                        }
                    });
                }
            } else {
                cb();
            }
        }
    });
};

//FOR GETTING HOME PRODUCTS LIST
fetchhomeProductList = function (prefetchDataDB, homeProductsDB, APP_ID, URL, cb) {
    var req = {
        headers: {
            app_id: APP_ID
        },
        body: {
            mobile_width: '300'
        },
        URL: URL,
        isAdmin: true
    };
    homeProducts(req, function (body) {
        if (body.status == 0) {
            cb();
        } else {
            var allData = body.msg;
            var reverseAllData = _.reverse(allData);
            async.eachOfLimit(reverseAllData, 10, processHomeProducts, function (err) {
                if (err) {
                    console.log('async eachOfLimt error. Line-105 File-/service/preFetchjs' + err);
                    cb();
                } else {
                    console.log('async eachOfLimt function working for Home Products. Line-108 File-/service/preFetchjs');
//                    cb();
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
                        console.log('Error. Line-124 File-/service/preFetchjs' + err);
                        callback();
                    } else {
//                        console.log('home product saved. Line-127 File-/service/preFetchjs');
//                        callback();
                        homeProductsDB.find({
                            "sku": item.data.sku,
                            "APP_ID": APP_ID
                        }, function (error, result) {
                            if (error) {
                                console.log('category not saved. Line-66 File-/service/preFetchjs' + error);
                                callback();
                            } else if (!result || result.length == 0) {
                                var productRecord = new homeProductsDB({
                                    "date": moment().format('MMMM Do YYYY, h:mm:ss a'),
                                    "sku": item.data.sku,
                                    "name": item.data.name,
                                    "json": item.data,
                                    "APP_ID": APP_ID,
                                    "price": parseInt(item.data.price),
                                    "in_stock": item.data.in_stock,
                                    "media_images": String,
                                    "small_image": String
                                });
                                productRecord.save(function (errorPro) {
                                    if (errorPro) {
                                        console.log('category not saved. Line-66 File-/service/preFetchjs' + errorPro);
                                        callback();
                                    } else {
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

//FOR RUNNING WEB CONFIG
fetchWebConfig = function (APP_ID, URL, cb) {
    var req = {
        headers: {
            app_id: APP_ID
        },
        body: {
            secret: 'optional'
        },
        URL: URL,
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

//FOR GETTING ALL PRODUCTS
fetchCategory = function (item, prefetchDataDB, categoryProductsDB, APP_ID, URL, cb) {
    var inputId = item.key;
    var inputPage = item.page;
    var myReq = {
        headers: {
            app_id: APP_ID
        },
        body: {
            id: inputId,
            limit: '10',
            mobile_width: '300',
            page: inputPage
        },
        URL: URL,
        isAdmin: true
    };
    categoryProducts(myReq, function (body) {
        if (body.status == 0) {
            if (body.msg == NOTFOUND) {
                console.log('Product is not found so category cache updated. Line-177 File-/service/preFetchjs');
                prefetchDataDB.update({
                    'key': inputId,
                    'type': PREFETCHCATEGORY,
                    APP_ID: APP_ID
                }, {
                    $set: {
                        cache: 1
                    }
                }, function (err) {
                    if (!err) {
                        console.log('Category Updated Done with cache 1. Line-187 File-/service/preFetchjs');
                        cb();
                    } else {
                        console.log('Error. Line-190 File-/service/preFetchjs' + err);
                        cb();
                    }
                });
            } else {
                console.log('category products not found. Line-195 File-/service/preFetchjs');
                cb();
            }
        } else {
            var allData = body.msg;
            if (allData.length > 0) {
                async.eachOfLimit(allData, 10, processCategoryProducts, function (err) {
                    if (err) {
                        console.log('async eachOfLimt error. Line-203 File-/service/preFetchjs' + err);
                        cb();
                    } else {
                        console.log('async eachOfLimt function working for Category Products. Line-206 File-/service/preFetchjs');
//                        cb();
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
                            console.log('product not saved. Line-224 File-/service/preFetchjs' + err);
                        } else {
                            categoryProductsDB.find({
                                "sku": row.sku,
                                "APP_ID": APP_ID
                            }, function (error, result) {
                                if (error) {
                                    console.log('category not saved. Line-66 File-/service/preFetchjs' + error);
                                    callback();
                                } else if (!result || result.length == 0) {
                                    var productRecord = new categoryProductsDB({
                                        "date": moment().format('MMMM Do YYYY, h:mm:ss a'),
                                        "sku": row.sku,
                                        "name": row.name,
                                        "json": row,
                                        "APP_ID": APP_ID,
                                        "price": parseInt(row.price),
                                        "in_stock": row.in_stock,
                                        "media_images": row.media_images[0],
                                        "small_image": row.small_image
                                    });
                                    productRecord.save(function (errorPro) {
                                        if (errorPro) {
                                            console.log('category not saved. Line-66 File-/service/preFetchjs' + errorPro);
                                            callback();
                                        } else {
                                            var page = inputPage;
                                            var myPage = (page * 1) + 1;
                                            prefetchDataDB.update({
                                                'key': inputId,
                                                'type': PREFETCHCATEGORY,
                                                'APP_ID': APP_ID
                                            }, {
                                                $set: {
                                                    page: myPage
                                                }
                                            }, function (err) {
                                                if (!err) {
                                                    console.log('Page No. Update Done. Line-237 File-/service/preFetchjs' + myPage);
                                                    callback();
                                                } else {
                                                    console.log('Error. Line-240 File-/service/preFetchjs' + err);
                                                    callback();
                                                }
                                            });
                                        }
                                    });
                                }
                            });
//                            var page = inputPage;
//                            var myPage = (page * 1) + 1;
//                            prefetchDataDB.update({
//                                'key': inputId,
//                                'type': PREFETCHCATEGORY,
//                                'APP_ID': APP_ID
//                            }, {
//                                $set: {
//                                    page: myPage
//                                }
//                            }, function (err) {
//                                if (!err) {
//                                    console.log('Page No. Update Done. Line-237 File-/service/preFetchjs' + myPage);
//                                    callback();
//                                } else {
//                                    console.log('Error. Line-240 File-/service/preFetchjs' + err);
//                                    callback();
//                                }
//                            });
                        }
                    });
                }
            }
        }
    });
};

//FOR GETTING PRODUCT GET
fetchProduct = function (item, prefetchDataDB, productsDB, APP_ID, URL, cb) {
    var inputId = item.key;
    var myReq = {
        headers: {
            app_id: APP_ID
        },
        body: {
            sku: inputId
        },
        URL: URL,
        isAdmin: true
    };
    productGet(myReq, function (body) {
        if (body.status == 0) {
            console.log('product get not found. Line-404 File-/service/preFetchjs');
            cb();
        } else {
            console.log('Product Get Done. Line-407 File-/service/preFetchjs');
            if (body.msg) {
                var row = body.msg.data.media_images;
                productsDB.find({
                    APP_ID: APP_ID,
                    sku: body.msg.data.sku
                }, function (err, result) {
                    if (err) {
                        console.log('Error. Line-415, File-service/preFetchjs' + err);
                        cb();
                    } else if (!result || result.length == 0) {
                        var record = new productsDB({
                            "date": moment().format('MMMM Do YYYY, h:mm:ss a'),
                            "sku": body.msg.data.sku,
                            "name": body.msg.data.name,
                            "json": body.msg.data,
                            "APP_ID": APP_ID,
                            "price": body.msg.data.price,
                            "in_stock": body.msg.data.in_stock,
                            "minify_image": body.msg.data.minify_image,
                            "small_image": body.msg.data.small_image
                        });
                        record.save(function (error) {
                            if (error) {
                                console.log('Error. Line-431, File-preFetchjs');
                                cb();
                            } else {
                                console.log('save done');
                                cb();
                            }
                        });
                    } else {
                        prefetchDataDB.update({
                            'key': inputId,
                            'type': PREFETCHPRODUCT,
                            'APP_ID': APP_ID
                        }, {
                            $set: {
                                cache: 1
                            }
                        }, function (err) {
                            if (!err) {
                                console.log('product Updated Done with cache 1. Line-449 File-/service/preFetchjs');
                                cb();
                            } else {
                                console.log('Error. Line-452 File-/service/preFetchjs' + err);
                                cb();
                            }
                        });
                    }
                });
            } else {
                cb();
            }
        }
    });
};


//RECURSIVE FUNCTION FOR GET SUBCATEGORY OF ALL CATEGORY
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