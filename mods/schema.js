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

//SCHEMA FOR CATEGORIES DB(DATA FETCHED FROM CRON AND SAVE MONGODB)
categories = new Schema({
    "date": String,
    "categoryId": String,
    "categoryName": String,
    "APP_ID": String,
    "json": Array
});

//SCHEMA FOR PRODUCTS DB(DATA FETCHED FROM CRON AND SAVE MONGODB)
products = new Schema({
    "date": String,
    "sku": String,
    "name": String,
    "json": Array,
    "APP_ID": String,
    "price": Number,
    "in_stock": String,
    "media_images": String,
    "small_image": String
});

//SCHEMA FOR HOME PRODUCTS DB(DATA FETCHED FROM CRON AND SAVE MONGODB)
homeProductsData = new Schema({
    "date": String,
    "sku": String,
    "name": String,
    "json": Array,
    "APP_ID": String,
    "price": Number,
    "in_stock": String,
    "media_images": String,
    "small_image": String
});

//SCHEMA FOR HOME SLIDER DB(DATA FETCHED FROM CRON AND SAVE MONGODB)
homeSliderData = new Schema({
    "date": String,
    "url": String,
    "APP_ID": String
});