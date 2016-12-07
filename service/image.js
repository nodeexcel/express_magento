require('node-import');
imports('config/index');
imports('config/constant');
var request = require('request');
var fileExists = require('file-exists');
var sharp = require('sharp');
var http = require('http');
var imagemin = require('imagemin');
var imageminMozjpeg = require('imagemin-mozjpeg');
var imageminPngquant = require('imagemin-pngquant');
var fs = require('fs');
var URL_ = require('url');
var mkdirp = require('mkdirp');
var path = require('path');

resize = function (url, APP_ID, mobile_width, callback) {
    
      callback(200, config.DEFAULT_IMAGE_URL);
      return;
    
    if (url && APP_ID) {
        if (mobile_width) {
            mobile_width = mobile_width;
        } else {
            mobile_width = 200;
        }
        var image_url = URL_.parse(url).path;
        var app_id = APP_ID.replace(/[^a-zA-Z0-9 ]/g, "");
        var image_stored_url = app_id + '/' + mobile_width + image_url;
        var url_last_index_length = url.lastIndexOf('/');
        var image_name = url.substring(url_last_index_length + 1);
        var filename = image_stored_url.substring(0, image_stored_url.lastIndexOf("/"));
        var image_name_without_extension = image_name.substr(0, image_name.lastIndexOf('.'));
        var image_webp = '/' + image_name_without_extension + '.webp';
        var image_png = '/' + image_name_without_extension + '.png';
        if (image_name_without_extension == '') {
            callback(200, config.DEFAULT_IMAGE_URL);
        } else {
            if (fileExists('public/original_image/' + image_name) == false) {
                var width = parseInt(mobile_width);
                var file = fs.createWriteStream("public/original_image/" + image_name);
                http.get(url, function (response) {
                    mkdirp('public/' + filename, function (err) {
                        if (err) {
                            callback(500, "oops! some error occured");
                        } else {
                        }
                    });
                    if (response.statusCode == 200) {
                        response.pipe(file);
                        response.on('end', function () {
                            sharp('public/original_image/' + image_name)
                                    .resize(width)
                                    .toFile('public/' + filename + image_webp, function (err) {
                                        if (err) {
                                            callback(500, err);
                                        } else if (err === null) {
                                            sharp('public/original_image/' + image_name)
                                                    .resize(width)
                                                    .toFile('public/' + filename + image_png, function (err) {
                                                        callback(200, config.CDN_URL + filename + image_png);
                                                    });
                                        } else {
                                            callback(500, "oops! some error occured");
                                        }
                                    });
                        });
                    } else {
                        callback(200,config.DEFAULT_IMAGE_URL);
                    }
                });
            } else {
                callback(200, config.CDN_URL + filename + image_png);
            }
        }
    } else {
        callback(500, " APP_ID or url or mobile_width cannot be empty");
    }
};

minify = function (url, APP_ID, callback) {
    if (url && APP_ID) {
        var image_url = URL_.parse(url).path;
        var filename = image_url.substring(0, image_url.lastIndexOf("/"));
        var url_last_index_length = url.lastIndexOf('/');
        var image_name = url.substring(url_last_index_length + 1);
        var image_name_without_extension = image_name.substr(0, image_name.lastIndexOf('.'));
        var image_jpg = '/' + image_name_without_extension + '.jpg';
        var image_minified_name = filename.replace("comtethr/300", "comtethr/300/minify");
        
        callback(200, config.CDN_URL+image_minified_name+image_jpg);
        return;
        
        if (fileExists('public' + image_minified_name + '/' + image_jpg) == false) {
                imagemin(["public/original_image/" + image_jpg], 'public/' + image_minified_name, {
                 plugins: [
                 imageminMozjpeg(),
                 imageminPngquant({quality: '5'})
                 ]
                }).then(files => {
                     if (files[0].path !== null) {
                         callback(200, config.CDN_URL+image_minified_name+image_jpg );
                     } else {
                         callback(500, "oops! some error occured");
                     }
           })
        } else {
            callback(200, config.CDN_URL+image_minified_name+image_jpg);
        }
    } else {
        callback(500, " APP_ID or url cannot be empty");
    }
};