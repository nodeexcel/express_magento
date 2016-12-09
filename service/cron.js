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
                console.log(err);
            } else if (!user) {
                console.log(user);
            } else {
                var selectId = user._id;
                var URL = user.URL;
                cron_running_time = user.cron_running_time;
                var current_time = moment().tz('Asia/Calcutta').format('HH:mm ZZ'); //13:56:34 +0530
                var format = 'HH:mm ZZ';
                var cron_running_time_with_IST = moment(cron_running_time, format).tz('Asia/Calcutta').format(format);
//               if (current_time == cron_running_time_with_IST) {         // IF CONDITION STARTS

                console.log('You will see this message every minute');

                fetchWebConfig(app_id, URL, function (respond) {
                    if (respond.status != 0) {
                        prefetchDataDB.find({
                            cache: 0,
                            APP_ID: app_id
                        }).limit(5).exec(function (err, result) {
                            if (err) {
                                console.log(err);
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
                                            console.log(err);
                                        } else {
                                            console.log('prefetch status RUNNING');
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
                                                        console.log('start list not saved');
                                                    } else {
                                                        console.log('start list saved');
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
                                            console.log(err);
                                        } else {
                                            console.log('Prefetch Status FINISHED');
                                        }
                                    });
                                }
                            } else {
                                if (user.prefetch_status == 'RUNNING') {
//                            async eachOfLimit function
                                    async.eachOfLimit(result, 3, processRecord, function (err) {
                                        if (err) {
                                            console.log('async eachOfLimt error' + err);
                                        } else {
                                            console.log('async eachOfLimt function working...!!');
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
                                                    conosle.log('Category List not updated' + err);
                                                    callback();
                                                } else {
                                                    console.log('fetchCategoryList function run');
                                                    fetchCategoryList(prefetchDataDB, app_id, URL, respond.msg.store_id, function () {
                                                        console.log('Category List end!!');
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
                                                    conosle.log('Home Slider not updated' + err);
                                                    callback();
                                                } else {
                                                    console.log('fetchHomeSliderList function run');
                                                    fetchHomeSliderList(prefetchDataDB, app_id, URL, function () {
                                                        console.log('Home Slider end!!');
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
                                                    conosle.log('Home Products not updated' + err);
                                                    callback();
                                                } else {
                                                    console.log('fetchhomeProductList function run');
                                                    fetchhomeProductList(prefetchDataDB, app_id, URL, function () {
                                                        console.log('Home Products end!!');
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
                                                    conosle.log('Category not updated' + err);
                                                    callback();
                                                } else {
                                                    console.log('fetchCategory function run');
                                                    fetchCategory(prefetchDataDB, app_id, URL, function () {
                                                        console.log('Category end!!');
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
                                                    conosle.log('Products not updated' + err);
                                                    callback();
                                                } else {
                                                    console.log('fetchProduct function run');
                                                    fetchProduct(prefetchDataDB, app_id, URL, function () {
                                                        console.log('Products end!!');
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
