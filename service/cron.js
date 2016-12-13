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

//var Schema = mongoose.Schema;
var conn = mongoose.connection;
var Grid = require('gridfs-stream');
Grid.mongo = mongoose.mongo;

var app_urls = conn.model('AppUrls', app_url_schema);

var CollectioncategoryList = conn.model('categoryListCache', categoryListSchema);

var homeSlider = conn.model('homeSliderCache', homeSliderSchema);

var homeProducts = conn.model('homeProductsCache', homeProductSchema);

processStore = function (app_id) {
    // pattern for crone  after 5 min '*/5 * * * *'
    new CronJob('* * * * * *', function () {
        app_urls.findOne({APP_ID: app_id}, function (err, user) {
            if (err) {
                console.log(err);
            } else if (!user) {
                console.log(user);
            } else {
                cron_running_time = user.cron_running_time;
                var current_time = moment().tz('Asia/Calcutta').format('HH:mm ZZ'); //13:56:34 +0530
                var format = 'HH:mm ZZ';
                var cron_running_time_with_IST = moment(cron_running_time, format).tz('Asia/Calcutta').format(format);
                if (current_time == cron_running_time_with_IST) {         // IF CONDITION STARTS

                    console.log('You will see this message every minute');

//********************* START, CRON FOR CATEGORY PRODUCTS ************************
                    fetchCategoryList(CollectioncategoryList);
//********************* END, CRON FOR CATEGORY PRODUCTS ************************

//********************* START, CRON FOR HOME SLIDER ************************
                    fetchHomeSliderList(homeSlider);
//********************* END, CRON FOR HOME SLIDER **************************

//********************* START, CRON FOR HOME PRODUCTS ************************
                    fetchhomeProductList(homeProducts);
//********************* END, CRON FOR HOME PRODUCTS ************************

                }   //END IF CONDITION
            }
        });
    }, null, true);
};
