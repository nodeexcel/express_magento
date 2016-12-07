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

var prefetchDataDB = conn.model('prefetchData', prefetchData);

processStore = function (app_id) {
// pattern for crone  after 5 min '*/5 * * * *'
    new CronJob('*/1 * * * *', function () {
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
                if (current_time == cron_running_time_with_IST) {         // IF CONDITION STARTS

                    console.log('You will see this message every minute');

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
                                        console.log('prefetch status updated');
                                        var reqArray = [
                                            {"req": {headers: {app_id: config.APP_ID},
                                                    body: {store_id: '1', parent_id: '1', type: 'full'},
                                                    URL: config.URL
                                                }, "reqType": "Category List", "name": "Category List"},
                                            {"req": {headers: {app_id: config.APP_ID},
                                                    body: {mobile_width: '300'},
                                                    URL: config.URL
                                                }, "reqType": "Home Slider", "name": "Home Slider"},
                                            {"req": {headers: {app_id: config.APP_ID},
                                                    body: {mobile_width: '300'},
                                                    URL: config.URL
                                                }, "reqType": "Home Products", "name": "Home Products"}
                                        ];
                                        _.forEach(reqArray, function (row) {
                                            var record = new prefetchDataDB({
//                                            "cache": 0,
                                                "req": row.req,
                                                "reqType": row.reqType,
                                                "name": row.name
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
//                            async eachOfLimit function
                                async.eachOfLimit(result, 3, processRecord, function (err) {
                                    if (err) {
                                        console.log('async eachOfLimt error');
                                    } else {
                                        console.log('async eachOfLimt function working...!!');
                                    }
                                });
                                function processRecord(item, key, callback) {
                                    if (item.reqType == 'Category List') {
                                        prefetchDataDB.remove({
                                            name: 'Category List'
                                        }, function (err) {
                                            if (err) {
                                                conosle.log('Category List not deleted');
                                            } else {
                                                console.log('Record Deleted!!');
                                                fetchCategoryList(prefetchDataDB, function () {
                                                    console.log('Category List end!!');
                                                    callback(0);
                                                });
                                            }
                                        });
                                    } else if (item.reqType == 'Home Slider') {
                                        prefetchDataDB.remove({
                                            name: 'Home Slider'
                                        }, function (err) {
                                            if (err) {
                                                conosle.log('Home Slider not deleted');
                                            } else {
                                                console.log('Record Deleted!!');
                                                fetchHomeSliderList(prefetchDataDB, function () {
                                                    console.log('Home Slider end!!');
                                                    callback(0);
                                                });
                                            }
                                        });
                                    } else if (item.reqType == 'Home Products') {
                                        prefetchDataDB.remove({
                                            name: 'Home Products'
                                        }, function (err) {
                                            if (err) {
                                                conosle.log('Home Products not deleted');
                                            } else {
                                                console.log('Record Deleted!!');
                                                fetchhomeProductList(prefetchDataDB, function () {
                                                    console.log('Home Products end!!');
                                                    callback(0);
                                                });
                                            }
                                        });
                                    }
                                }
                            }
                        }
                    });

                }   //END IF CONDITION
            }
        });
    }, null, true);
};
