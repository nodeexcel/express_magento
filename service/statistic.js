imports('config/index');
imports('config/constant');
require('node-import');
require('../mods/schema');
var mongoose = require('mongoose');
var conn = mongoose.connection;
var Grid = require('gridfs-stream');
Grid.mongo = mongoose.mongo;
var staticsticAPIDB = conn.model('staticsticAPI', staticsticAPI);

//WHEN DATA COMES FROM REDIS
setStatisticRedis = function (nameAPI) {
    staticsticAPIDB.findOne({
        nameAPI: nameAPI
    }, function (error, row) {
        if (error) {
            console.log('Error. Line-17, File-service/statisticjs' + error);
        } else if (row) {
//          UPDATED RECORD AFTER FIRST TIME
            var totalAPI = row.totalAPI;
            var redisAPI = row.redisAPI;
            var magentoAPI = row.magentoAPI;
            staticsticAPIDB.update({
                nameAPI: nameAPI
            }, {
                $set: {
                    totalAPI: totalAPI + 1,
                    redisAPI: redisAPI + 1,
                    magentoAPI: magentoAPI
                }
            }, function (err) {
                if (!err) {
                    console.log(nameAPI + ' Updated Done with cache 1. Line-33 File-/service/stitisticjs');
                } else {
                    console.log('Error. Line-35 File-/service/stitisticjs' + err);
                }
            });
        } else {
//          FIRST TIME WHEN RECORD NOT AVAILABLE
            var record = new staticsticAPIDB({
                nameAPI: nameAPI,
                totalAPI: 1,
                redisAPI: 1,
                magentoAPI: 0
            });
            record.save(function (err) {
                if (err) {
                    console.log('Error. Line-48, File-service/statisticjs' + err);
                } else {
                    console.log('Record saved. Line-51, File-service/statisticjs');
                }
            });
        }
    });
};

//WHEN DATA COMES FROM MAGENTO API
setStatisticMagento = function (nameAPI) {
    staticsticAPIDB.findOne({
        nameAPI: nameAPI
    }, function (error, row) {
        if (error) {
            console.log('Error. Line-63, File-service/statisticjs' + error);
        } else if (row) {
//          UPDATED RECORD AFTER FIRST TIME
            var totalAPI = row.totalAPI;
            var redisAPI = row.redisAPI;
            var magentoAPI = row.magentoAPI;
            staticsticAPIDB.update({
                nameAPI: nameAPI
            }, {
                $set: {
                    totalAPI: totalAPI + 1,
                    redisAPI: redisAPI,
                    magentoAPI: magentoAPI + 1
                }
            }, function (err) {
                if (!err) {
                    console.log(nameAPI + ' Updated Done with cache 1. Line-79 File-/service/stitisticjs');
                } else {
                    console.log('Error. Line-81 File-/service/stitisticjs' + err);
                }
            });
        } else {
//          FIRST TIME WHEN RECORD NOT AVAILABLE
            var record = new staticsticAPIDB({
                nameAPI: nameAPI,
                totalAPI: 1,
                redisAPI: 0,
                magentoAPI: 1
            });
            record.save(function (err) {
                if (err) {
                    console.log('Error. Line-94, File-service/statisticjs' + err);
                } else {
                    console.log('Record Saved. Line-96, File-service/statisticjs');
                }
            });
        }
    });
};