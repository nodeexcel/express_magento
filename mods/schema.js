require('node-import');
imports('config/index');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//SCHEMA FOR APP URL DB WHERE ALL MAGENTO STORE INFORMATION SAVED
app_url_schema = new Schema({
    headers: {type: String, required: true},
    URL: {type: String, required: true},
    status: {type: String, required: true},
    cron_running_time: {type: String, required: true},
    prefetch_status: {type: String, required: true}
});

//SCHEMA FOR PREFETCHADTA DB(DATA FETCHED FROM CRON AND SAVE MONGODB)
prefetchData = new Schema({
    "categoryId": String,
    "cache": Number,
    "key": String,
    "name": String,
    "type": String,
    "req": Array,
    "reqType": String,
    "APP_ID": String,
    "page": Number
});

//SCHEMA FOR STATICSTIC DB
staticsticAPI = new Schema({
    nameAPI: String,
    totalAPI: Number,
    redisAPI: Number,
    magentoAPI: Number
});