require('node-import');
imports('config/index');
require('./cron');
require('../mods/schema');
var _ = require('lodash');

//FOR RUNNING A CRON
getActiveInstallations = function (app_urls) {
    app_urls.find({}, {APP_ID: 1, _id: 0}, function (err, value) {
        if (err) {
            console.log('Error. Line-11, File-service/magentojs' + err);
        } else if (!value) {
            console.log('Value not available. Line-13, Files-service/magentojs' + value);
        } else {
            _.forEach(value, function (row) {
                var app_id = row.get('APP_ID');
                processStore(app_id);
            });
        }
    });
};