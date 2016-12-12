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
setStatisticRedis = function (nameAPI, callback) {
    staticsticAPIDB.findOne({
        nameAPI: nameAPI
    }, function (error, row) {
        if (error) {
            callback({status: 0, msg: error});
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
                    console.log(nameAPI + ' Updated Done with cache 1. Line-31 File-/service/stitisticjs');
                    callback({status: 1});
                } else {
                    console.log('Error. Line-34 File-/service/stitisticjs' + err);
                    callback({status: 0, msg: err});
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
                    callback({status: 0, msg: err});
                } else {
                    callback({status: 1});
                }
            });
        }
    });
};

//WHEN DATA COMES FROM MAGENTO API
setStatisticMagento = function (nameAPI, callback) {
    staticsticAPIDB.findOne({
        nameAPI: nameAPI
    }, function (error, row) {
        if (error) {
            callback({status: 0, msg: error});
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
                    console.log(nameAPI + ' Updated Done with cache 1. Line-77 File-/service/stitisticjs');
                    callback({status: 1});
                } else {
                    console.log('Error. Line-80 File-/service/stitisticjs' + err);
                    callback({status: 0, msg: err});
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
                    callback({status: 0, msg: err});
                } else {
                    callback({status: 1});
                }
            });
        }
    });
};