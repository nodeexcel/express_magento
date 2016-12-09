require('node-import');
imports('config/index');
require('./cron');
require('../mods/schema');
var _ = require('lodash');

getActiveInstallations = function (app_urls) {
    app_urls.find({}, {APP_ID: 1, _id: 0}, function (err, value) {
        if (err) {
            console.log(err);
        } else if (!value) {
            console.log(value);
        } else {
            _.forEach(value, function (row) {
                var app_id = row.get('APP_ID');
                processStore(app_id);
            });
        }
    });
};