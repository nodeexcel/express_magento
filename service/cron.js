imports('config/index');
var CronJob = require('cron').CronJob;
var moment = require('moment');
var jstz = require('jstz');
var timezone = jstz.determine().name();
require('./category');
require('./home');
require('../mods/schema');
var _ = require('lodash');
var mongoose = require('mongoose');
require('./preFetch');
var async = require('async');

//var Schema = mongoose.Schema;
var conn = mongoose.connection;
var Grid = require('gridfs-stream');
Grid.mongo = mongoose.mongo;

var app_urls = conn.model('AppUrls', app_url_schema);

//var CollectioncategoryList = conn.model('categoryListCache', categoryListSchema);
//
//var homeSlider = conn.model('homeSliderCache', homeSliderSchema);
//
//var homeProducts = conn.model('homeProductsCache', homeProductSchema);

var prefetchDataDB = conn.model('prefetchData', prefetchData);

processStore = function (app_id) {
// pattern for crone  after 5 min '*/5 * * * *'
    new CronJob('* * * * * *', function () {
        app_urls.findOne({APP_ID: app_id}, function (err, user) {
            if (err) {
                console.log(err);
            } else if (!user) {
                console.log(user);
            } else {
                var selectId = user._id;
                cron_running_time = user.cron_running_time;
                var current_time = moment().tz('Asia/Calcutta').format('HH:mm ZZ'); //13:56:34 +0530
                var format = 'HH:mm ZZ';
                var cron_running_time_with_IST = moment(cron_running_time, format).tz('Asia/Calcutta').format(format);
//                if (current_time == cron_running_time_with_IST) {         // IF CONDITION STARTS

                console.log('You will see this message every minute');

//                if (user.prefetch_status == 'NOT STARTED') {
                prefetchDataDB.find().limit(5).exec(function (err, result) {
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
                                    var reqArray = [{"req": {headers: {app_id: config.APP_ID},
                                                body: {store_id: '1', parent_id: '1', type: 'full'},
                                                URL: config.URL
                                            }, "reqType": "Category List"},
                                        {"req": {headers: {app_id: config.APP_ID},
                                                body: {mobile_width: '300'},
                                                URL: config.URL
                                            }, "reqType": "Home Slider"},
                                        {"req": {headers: {app_id: config.APP_ID},
                                                body: {mobile_width: '300'},
                                                URL: config.URL
                                            }, "reqType": "Home Products"}];
                                    _.forEach(reqArray, function (row) {
                                        var record = new prefetchDataDB({
                                            "cache": 0,
                                            "req": row.req,
                                            "reqType": row.reqType
                                        });
                                        record.save(function (err) {
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
                            //async PARALLEL FUNCTION
                            async.parallel([
                                function (callback) {
                                    for (var a = 0; a < result.length; a++) {
                                        var row = result[a];
                                        var reqType = row.get('reqType');
                                        if (reqType == 'Category List') {
                                            prefetchDataDB.remove({reqType: 'Category List'}, function (err) {
                                                if (err) {
                                                    conosle.log('Category List not deleted');
                                                } else {
                                                    console.log('Record Deleted!!');
                                                    fetchCategoryList(prefetchDataDB);
                                                }
                                            });
                                        }
                                    }
                                    callback();
                                }, function (callback) {
                                    for (var a = 0; a < result.length; a++) {
                                        var row = result[a];
                                        var reqType = row.get('reqType');
                                        if (reqType == 'Home Slider') {
                                            prefetchDataDB.remove({reqType: 'Home Slider'}, function (err) {
                                                if (err) {
                                                    conosle.log('Home Slider not deleted');
                                                } else {
                                                    console.log('Record Deleted!!');
                                                    fetchHomeSliderList(prefetchDataDB);
                                                }
                                            });
                                        }
                                    }
                                    callback();
                                }, function (callback) {
                                    for (var a = 0; a < result.length; a++) {
                                        var row = result[a];
                                        var reqType = row.get('reqType');
                                        if (reqType == 'Home Products') {
                                            prefetchDataDB.remove({reqType: 'Home Products'}, function (err) {
                                                if (err) {
                                                    conosle.log('Home Products not deleted');
                                                } else {
                                                    console.log('Record Deleted!!');
                                                    fetchhomeProductList(prefetchDataDB);
                                                }
                                            });
                                        }
                                    }
                                    callback();
                                }
                            ], function (err) {
                                if (err) {
                                    console.log('parallel error');
                                } else {
                                    console.log('Parallel function working...!!');
                                }
                            });
                        }
                    }
                });
//                }

//********************* START, CRON FOR CATEGORY PRODUCTS ************************
//                fetchCategoryList(CollectioncategoryList);
//********************* END, CRON FOR CATEGORY PRODUCTS ************************

//********************* START, CRON FOR HOME SLIDER ************************
//                fetchHomeSliderList(homeSlider);
//********************* END, CRON FOR HOME SLIDER **************************

//********************* START, CRON FOR HOME PRODUCTS ************************
//                fetchhomeProductList(homeProducts);
//********************* END, CRON FOR HOME PRODUCTS ************************

//                }   //END IF CONDITION
            }
        });
    }, null, true);
};
