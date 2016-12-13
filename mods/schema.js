require('node-import');
imports('config/index');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

app_url_schema = new Schema({
    headers: {type: String, required: true, unique: true},
    url: {type: String, required: true, unique: true},
    status: {type: String, required: true, unique: true},
    cron_running_time: {type: String, required: true, unique: true}
});

categoryListSchema = new Schema({
    "cache": Number,
    "key": String,
    "name": String,
    "type": String
});

homeSliderSchema = mongoose.Schema({
    "cache": Number,
    "URL": String,
    "type": String
});

homeProductSchema = mongoose.Schema({
    cache: Number,
    key: String,
    categoryName: String,
    type: String
});
