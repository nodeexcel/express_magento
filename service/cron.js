imports('config/index');
imports('config/constant');
var CronJob = require('cron').CronJob;
var moment = require('moment');
var jstz = require('jstz');
var timezone = jstz.determine().name();
var _ = require('lodash');
var mongoose = require('mongoose');
var async = require('async');
require('./category');
require('./home');
require('../mods/schema');
require('./preFetch');
require('./web');

//var Schema = mongoose.Schema;
var conn = mongoose.connection;
var Grid = require('gridfs-stream');
Grid.mongo = mongoose.mongo;

var app_urls = conn.model('AppUrls', app_url_schema);

var prefetchDataDB = conn.model('prefetchData', prefetchData);

processStore = function (app_id) {
// pattern for crone  after 5 min '*/5 * * * *'
    new CronJob('*/1 * * * *', function () {
        app_urls.findOne({
            APP_ID: app_id
        }, function (err, user) {
            if (err) {
                console.log('Error. Line-32 File-/service/cronjs' + err);
            } else if (!user) {
                console.log('User not found. Line-34 File-/service/cronjs');
            } else {
                var selectId = user._id;
                var URL = user.URL;
                cron_running_time = user.cron_running_time;
                var current_time = moment().tz('Asia/Calcutta').format('HH:mm ZZ'); //13:56:34 +0530
                var format = 'HH:mm ZZ';
                var cron_running_time_with_IST = moment(cron_running_time, format).tz('Asia/Calcutta').format(format);
//               if (current_time == cron_running_time_with_IST) {         // IF CONDITION STARTS

                console.log('You will see this message every minute. Line-44 File-/service/cronjs');

                fetchWebConfig(app_id, URL, function (respond) {
                    if (respond.status != 0) {
                        prefetchDataDB.find({
                            cache: 0,
                            APP_ID: app_id
                        }).limit(10).exec(function (err, result) {
                            if (err) {
                                console.log('Error. Line-53 File-/service/cronjs' + err);
                            } else if (!result || result.length == 0) {
                                if (user.prefetch_status == 'NOT STARTED') {
                                    app_urls.update({
                                        _id: selectId
                                    }, {
                                        $set: {
                                            prefetch_status: 'RUNNING'
                                        }
                                    }, function (err) {
                                        if (err) {
                                            console.log('Error. Line-64 File-/service/cronjs' + err);
                                        } else {
                                            console.log('prefetch status RUNNING. Line-66 File-/service/cronjs');
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
//                                                {
//                                                    "req": {
//                                                        headers: {
//                                                            app_id: app_id
//                                                        },
//                                                        body: {
//                                                            mobile_width: '300'
//                                                        },
//                                                        URL: URL
//                                                    },
//                                                    "reqType": PREFETCHHOMESLIDER,
//                                                    "name": PREFETCHHOMESLIDER,
//                                                    "APP_ID": app_id
//                                                },
//                                                {
//                                                    "req": {
//                                                        headers: {
//                                                            app_id: app_id
//                                                        },
//                                                        body: {
//                                                            mobile_width: '300'
//                                                        },
//                                                        URL: URL
//                                                    },
//                                                    "reqType": PREFETCHHOMEPRODUCTS,
//                                                    "name": PREFETCHHOMEPRODUCTS,
//                                                    "APP_ID": app_id
//                                                }
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
                                                        console.log('start list not saved. Line-123 File-/service/cronjs');
                                                    } else {
                                                        console.log('start list saved. Line-125 File-/service/cronjs');
                                                    }
                                                });
                                            });
                                        }
                                    });
                                } else {
                                    app_urls.update({
                                        _id: selectId
                                    }, {
                                        $set: {
                                            prefetch_status: 'FINISHED'
                                        }
                                    }, function (err) {
                                        if (err) {
                                            console.log('Error. Line-140 File-/service/cronjs' + err);
                                        } else {
                                            console.log('Prefetch Status FINISHED. Line-143 File-/service/cronjs');
                                        }
                                    });
                                }
                            } else {
                                if (user.prefetch_status == 'RUNNING') {
//                            async eachOfLimit function
                                    async.eachOfLimit(result, 3, processRecord, function (err) {
                                        if (err) {
                                            console.log('async eachOfLimt error. Line-151 File-/service/cronjs' + err);
                                        } else {
                                            console.log('async eachOfLimt function working.. Line-153 File-/service/cronjs');
                                        }
                                    });
                                    function processRecord(item, key, callback) {
                                        if (item.reqType == PREFETCHCATEGORYLIST) {
                                            prefetchDataDB.update({
                                                _id: item._id,
                                                cache: 0
                                            }, {
                                                $set: {
                                                    cache: 1
                                                }
                                            }, function (err) {
                                                if (err) {
                                                    conosle.log('Category List not updated. Line-167 File-/service/cronjs' + err);
                                                    callback();
                                                } else {
                                                    console.log('fetchCategoryList function run. Line-170 File-/service/cronjs');
                                                    fetchCategoryList(prefetchDataDB, app_id, URL, respond.msg.store_id, function () {
                                                        console.log('Category List end. Line-172 File-/service/cronjs');
                                                        callback();
                                                    });
                                                }
                                            });
                                        } else if (item.reqType == PREFETCHHOMESLIDER) {
                                            prefetchDataDB.update({
                                                _id: item._id,
                                                cache: 0
                                            }, {
                                                $set: {
                                                    cache: 1
                                                }
                                            }, function (err) {
                                                if (err) {
                                                    conosle.log('Home Slider not updated. Line-187 File-/service/cronjs' + err);
                                                    callback();
                                                } else {
                                                    console.log('fetchHomeSliderList function run. Line-190 File-/service/cronjs');
                                                    fetchHomeSliderList(prefetchDataDB, app_id, URL, function () {
                                                        console.log('Home Slider end. Line-192 File-/service/cronjs');
                                                        callback();
                                                    });
                                                }
                                            });
                                        } else if (item.reqType == PREFETCHHOMEPRODUCTS) {
                                            prefetchDataDB.update({
                                                _id: item._id,
                                                cache: 0
                                            }, {
                                                $set: {
                                                    cache: 1
                                                }
                                            }, function (err) {
                                                if (err) {
                                                    conosle.log('Home Products not updated. Line-207 File-/service/cronjs' + err);
                                                    callback();
                                                } else {
                                                    console.log('fetchhomeProductList function run. Line-210 File-/service/cronjs');
                                                    fetchhomeProductList(prefetchDataDB, app_id, URL, function () {
                                                        console.log('Home Products end. Line-212 File-/service/cronjs');
                                                        callback();
                                                    });
                                                }
                                            });
                                        } else if (item.reqType == PREFETCHCATEGORY) {
                                            prefetchDataDB.update({
                                                _id: item._id,
                                                cache: 0
                                            }, {
                                                $set: {
                                                    cache: 1
                                                }
                                            }, function (err) {
                                                if (err) {
                                                    conosle.log('Category not updated. Line-227 File-/service/cronjs' + err);
                                                    callback();
                                                } else {
                                                    console.log('fetchCategory function run. Line-230 File-/service/cronjs');
                                                    fetchCategory(prefetchDataDB, app_id, URL, function () {
                                                        console.log('Category end. Line-232 File-/service/cronjs');
                                                        callback();
                                                    });
                                                }
                                            });
                                        } else if (item.reqType == PREFETCHPRODUCT) {
                                            prefetchDataDB.update({
                                                _id: item._id,
                                                cache: 0
                                            }, {
                                                $set: {
                                                    cache: 1
                                                }
                                            }, function (err) {
                                                if (err) {
                                                    conosle.log('Products not updated. Line-247 File-/service/cronjs' + err);
                                                    callback();
                                                } else {
                                                    console.log('fetchProduct function run. Line-250 File-/service/cronjs');
                                                    fetchProduct(prefetchDataDB, app_id, URL, function () {
                                                        console.log('Products end. Line-252 File-/service/cronjs');
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