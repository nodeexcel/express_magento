imports('config/index');
imports('config/constant');
var CronJob = require('cron').CronJob;
var moment = require('moment');
var jstz = require('jstz');
var timezone = jstz.determine().name();
var _ = require('lodash');
var mongoose = require('mongoose');
var async = require('async');
require('../mods/schema');
require('./category');
require('./home');
require('./preFetch');
require('./web');
//var Schema = mongoose.Schema;
var conn = mongoose.connection;
var Grid = require('gridfs-stream');
Grid.mongo = mongoose.mongo;

var app_urls = conn.model('AppUrls', app_url_schema);
var prefetchDataDB = conn.model('prefetchData', prefetchData);
var categoriesDB = conn.model('categories', categories);
var productsDB = conn.model('products', products);
var homeSliderDB = conn.model('homeSliderData', homeSliderData);
var homeProductsDB = conn.model('homeProductsData', homeProductsData);

//FOR RUNNING THE CRON
processStore = function (app_id) {
// pattern for crone  after 5 min '*/5 * * * *'
    new CronJob('*/1 * * * *', function () {
        app_urls.findOne({
            APP_ID: app_id
        }, function (err, user) {
            if (err) {
                console.log('Error. Line-33 File-/service/cronjs' + err);
            } else if (!user) {
                console.log('User not found. Line-35 File-/service/cronjs');
            } else {
                var selectId = user._id;
                var URL = user.URL;
                cron_running_time = user.cron_running_time;
                var current_time = moment().tz('Asia/Calcutta').format('HH:mm ZZ'); //13:56:34 +0530
                var format = 'HH:mm ZZ';
                var cron_running_time_with_IST = moment(cron_running_time, format).tz('Asia/Calcutta').format(format);
//APIS RUN IF CURRENT TIME AND SAVED DB TIME BOTH MATCH
//                if (current_time == cron_running_time_with_IST) {         // IF CONDITION STARTS
                console.log('You will see this message every minute. Line-45 File-/service/cronjs');
                fetchWebConfig(app_id, URL, function (respond) {
                    if (respond.status != 0) {
                        prefetchDataDB.find({
                            cache: 0,
                            APP_ID: app_id
                        }).limit(10).exec(function (err, result) {
                            if (err) {
                                console.log('Error. Line-53 File-/service/cronjs' + err);
                            } else if (!result || result.length == 0) {
//                                    API RUN WHEN FIRST TIME CRON WILL START
                                if (user.prefetch_status == 'NOT STARTED') {
//                                        PREFETCH STATUS WILL UPDATED
                                    app_urls.update({
                                        _id: selectId
                                    }, {
                                        $set: {
                                            prefetch_status: 'RUNNING'
                                        }
                                    }, function (err) {
                                        if (err) {
                                            console.log('Error. Line-67 File-/service/cronjs' + err);
                                        } else {
                                            console.log('prefetch status RUNNING. Line-68 File-/service/cronjs');
                                            var reqArray = [
                                                {
                                                    "req": {
                                                        headers: {
                                                            app_id: app_id
                                                        },
                                                        body: {
                                                            store_id: respond.msg.store_id,
                                                            parent_id: '1',
                                                            type: 'full'
                                                        },
                                                        URL: URL
                                                    },
                                                    "reqType": PREFETCHCATEGORYLIST,
                                                    "name": PREFETCHCATEGORYLIST,
                                                    "APP_ID": app_id
                                                },
                                                {
                                                    "req": {
                                                        headers: {
                                                            app_id: app_id
                                                        },
                                                        body: {
                                                            mobile_width: '300'
                                                        },
                                                        URL: URL
                                                    },
                                                    "reqType": PREFETCHHOMESLIDER,
                                                    "name": PREFETCHHOMESLIDER,
                                                    "APP_ID": app_id
                                                },
                                                {
                                                    "req": {
                                                        headers: {
                                                            app_id: app_id
                                                        },
                                                        body: {
                                                            mobile_width: '300'
                                                        },
                                                        URL: URL
                                                    },
                                                    "reqType": PREFETCHHOMEPRODUCTS,
                                                    "name": PREFETCHHOMEPRODUCTS,
                                                    "APP_ID": app_id
                                                }
                                            ];
                                            _.forEach(reqArray, function (row) {
                                                var record = new prefetchDataDB({
                                                    "cache": 0,
                                                    "req": row.req,
                                                    "reqType": row.reqType,
                                                    "name": row.name,
                                                    "APP_ID": row.APP_ID
                                                });
                                                record.save(function (err) {
                                                    if (err) {
                                                        console.log('start list not saved. Line-125 File-/service/cronjs');
                                                    } else {
                                                        console.log('start list saved. Line-127 File-/service/cronjs');
                                                    }
                                                });
                                            });
                                        }
                                    });
                                } else {
//                                        IF ALL APIS CACHE 1 PREFETCH STATUS UPDATED AS FINISHED
                                    app_urls.update({
                                        _id: selectId
                                    }, {
                                        $set: {
                                            prefetch_status: 'FINISHED'
                                        }
                                    }, function (err) {
                                        if (err) {
                                            console.log('Error. Line-143 File-/service/cronjs' + err);
                                        } else {
                                            console.log('Prefetch Status FINISHED. Line-145 File-/service/cronjs');
                                        }
                                    });
                                }
                            } else {
                                if (user.prefetch_status == 'RUNNING') {
//                            async eachOfLimit function
                                    async.eachOfLimit(result, 3, processRecord, function (err) {
                                        if (err) {
                                            console.log('async eachOfLimt error. Line-154 File-/service/cronjs' + err);
                                        } else {
                                            console.log('async eachOfLimt function working.. Line-156 File-/service/cronjs');
                                        }
                                    });
                                    function processRecord(item, key, callback) {
                                        if (item.reqType == PREFETCHCATEGORYLIST) { //IF REQUEST TYPE CATEGORYLIST, UPDATED CACHE 1
                                            prefetchDataDB.update({
                                                _id: item._id,
                                                cache: 0,
                                                APP_ID: app_id
                                            }, {
                                                $set: {
                                                    cache: 1
                                                }
                                            }, function (err) {
                                                if (err) {
                                                    conosle.log('Category List not updated. Line-170 File-/service/cronjs' + err);
                                                    callback();
                                                } else {
                                                    console.log('fetchCategoryList function run. Line-173 File-/service/cronjs');
//                                                        FUNCTION CALLED FOR GETTING CATEGORY LIST
                                                    fetchCategoryList(prefetchDataDB, categoriesDB, app_id, URL, respond.msg.store_id, function () {
                                                        console.log('Category List end. Line-176 File-/service/cronjs');
                                                        callback();
                                                    });
                                                }
                                            });
                                        } else if (item.reqType == PREFETCHHOMESLIDER) {        //IF REQUEST TYPE HOMESLIDER, UPDATED CACHE 1 
                                            prefetchDataDB.update({
                                                _id: item._id,
                                                cache: 0,
                                                APP_ID: app_id
                                            }, {
                                                $set: {
                                                    cache: 1
                                                }
                                            }, function (err) {
                                                if (err) {
                                                    console.log('Home Slider not updated. Line-191 File-/service/cronjs' + err);
                                                    callback();
                                                } else {
                                                    console.log('fetchHomeSliderList function run. Line-194 File-/service/cronjs');
//                                                        FUNCTION CALLED FOR GETTING HOME SLIDER LIST 
                                                    fetchHomeSliderList(homeSliderDB, app_id, URL, function () {
                                                        console.log('Home Slider end. Line-197 File-/service/cronjs');
                                                        callback();
                                                    });
                                                }
                                            });
                                        } else if (item.reqType == PREFETCHHOMEPRODUCTS) {      //IF REQUEST TYPE HOMEPRODUCTS, UPDATED CACHE 1
                                            prefetchDataDB.update({
                                                _id: item._id,
                                                cache: 0,
                                                APP_ID: app_id
                                            }, {
                                                $set: {
                                                    cache: 1
                                                }
                                            }, function (err) {
                                                if (err) {
                                                    conosle.log('Home Products not updated. Line-213 File-/service/cronjs' + err);
                                                    callback();
                                                } else {
                                                    console.log('fetchhomeProductList function run. Line-216 File-/service/cronjs');
//                                                        FUNCTION CALLED FOR GETTING HOME PRODUCT LIST
                                                    fetchhomeProductList(prefetchDataDB, homeProductsDB, app_id, URL, function () {
                                                        console.log('Home Products end. Line-219 File-/service/cronjs');
                                                        callback();
                                                    });
                                                }
                                            });
                                        } else if (item.reqType == PREFETCHCATEGORY) {  //IF REQUEST TYPE CATEGORY
//                                            prefetchDataDB.update({
//                                                _id: item._id,
//                                                cache: 0
//                                            }, {
//                                                $set: {
//                                                    cache: 1
//                                                }
//                                            }, function (err) {
//                                                if (err) {
//                                                    conosle.log('Category not updated. Line-227 File-/service/cronjs' + err);
//                                                    callback();
//                                                } else {
                                            console.log('fetchCategory function run. Line-237 File-/service/cronjs');
//                                                FUNCTION CALLED FOR GETTING LIST OF ALL PRODUCTS FOR ALL CATEGORIES
                                            fetchCategory(item, prefetchDataDB, productsDB, app_id, URL, function () {
                                                console.log('Category end. Line-240 File-/service/cronjs');
                                                callback();
                                            });
//                                                }
//                                            });
                                        } else if (item.reqType == PREFETCHPRODUCT) {   // IF REQUEST TYPE PRODUCT, UPADTED CACHE 1
                                            prefetchDataDB.update({
                                                _id: item._id,
                                                cache: 0,
                                                APP_ID: app_id
                                            }, {
                                                $set: {
                                                    cache: 1
                                                }
                                            }, function (err) {
                                                if (err) {
                                                    conosle.log('Products not updated. Line-255 File-/service/cronjs' + err);
                                                    callback();
                                                } else {
                                                    console.log('fetchProduct function run. Line-258 File-/service/cronjs');
//                                                        FUNCTION CALLED FOR GETTING PRODUCT REVIEW
                                                    fetchProduct(item, prefetchDataDB, app_id, URL, function () {
                                                        console.log('Products end. Line-261 File-/service/cronjs');
                                                        callback();
                                                    });
                                                }
                                            });
                                        }
                                    }
                                }
                            }
                        });
                    }
                });
//                }   //END IF CONDITION
            }
        });
    }, null, true);
};