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
var sizeOf = require('image-size');
var path = require('path');

//FOR RESIZE IMAGE
resize = function (req, url, callback) {
    var APP_ID = req.headers.app_id;
    if (url && APP_ID) {
        var image_url = URL_.parse(url).path;
        var app_id = APP_ID.replace(/[^a-zA-Z0-9 ]/g, "");
        var image_stored_url = app_id + '/' + image_url;
        var url_last_index_length = url.lastIndexOf('/');
        var image_name = url.substring(url_last_index_length + 1);
        var filename = image_stored_url.substring(0, image_stored_url.lastIndexOf("/"));
        var image_name_without_extension = image_name.substr(0, image_name.lastIndexOf('.'));
        var image_webp = '/' + image_name_without_extension + '.webp';
        var image_png = '/' + image_name_without_extension + '.png';
        if (image_name_without_extension == '') {
            callback(200, config.DEFAULT_IMAGE_URL);
        } else {
            if (fileExists('public/original_image/' + image_name) == false && req.isAdmin == true) {
                var file = fs.createWriteStream("public/original_image/" + image_name);
                http.get(url, function (response) {
                    mkdirp('public/' + filename, function (err) {
                        if (err) {
                            callback(500, config.DEFAULT_IMAGE_URL);
                        } else {
                        }
                    });
                    if (response.statusCode == 200) {
                        response.pipe(file);
                        response.on('end', function () {
                            sizeOf('public/original_image/' + image_name, function (err, dimensions) {
                                if (dimensions) {
                                    if (dimensions.width > 480 || dimensions.height > 240) {
                                        if (dimensions.width > 480) {
                                           var sharp_resize_width = 480;
                                        } else if (dimensions.height > 240) {
                                         var sharp_resize_height = 240;
                                        }
                                        sharp('public/original_image/' + image_name)
                                                .resize(sharp_resize_width,sharp_resize_height)
                                                .toFile('public/' + filename + image_webp, function (err) {
                                                    if (err) {
                                                        callback(500, config.DEFAULT_IMAGE_URL);
                                                    } else if (err === null) {
                                                        sharp('public/original_image/' + image_name)
                                                                .resize(480)
                                                                .toFile('public/' + filename + image_png, function (err) {
                                                                    callback(200, config.CDN_URL + filename + image_png);
                                                                });
                                                    } else {
                                                        callback(500, config.DEFAULT_IMAGE_URL);
                                                    }
                                                });
                                    } else {
                                        callback(200, config.CDN_URL + 'public/original_image/' + image_name);
                                    }
                                } else {
                                    callback(500, url);
                                }
                            });
                        });
                    } else {
                        callback(200, url);
                    }
                });
            } else {
                if (fileExists('public/original_image/' + image_name) == false) {
                    callback(200, url)
                } else {
                    callback(200, config.CDN_URL + filename + image_png);
                }
            }
        }
    } else {
        callback(500, config.DEFAULT_IMAGE_URL);
    }
};

//FOR MINIFY IMAGE
minify = function (req, url, callback) {
    var APP_ID = req.headers.app_id;
    if (url && APP_ID) {
        var image_url = URL_.parse(url).path;
        var app_id = APP_ID.replace(/[^a-zA-Z0-9 ]/g, "");
        var filename = image_url.substring(0, image_url.lastIndexOf("/"));
        var url_last_index_length = url.lastIndexOf('/');
        var image_name = url.substring(url_last_index_length + 1);
        var image_name_without_extension = image_name.substr(0, image_name.lastIndexOf('.'));
        var image_jpg = '/' + image_name_without_extension + '.jpg';
        var image_minified_name = filename.replace(app_id + "/", app_id + "/minify");
        if (filename == '/default') {
            callback(200, config.DEFAULT_IMAGE_URL);
        } else {
            sizeOf('public/original_image/' + image_name, function (err, dimensions) {
                if (dimensions) {
                    if (dimensions.width > 480 || dimensions.height > 240) {
                        if (fileExists('public' + image_minified_name + '/' + image_jpg) == false && req.isAdmin == true) {
                                 imagemin(["public/" + image_url], 'public' + image_minified_name, {
                                  plugins: [
                                  imageminMozjpeg(),
                                  imageminPngquant({quality: '5'})
                                  ]
                                 }).then(files => {
                                      if (files[0].path !== null) {
                                          callback(200, config.CDN_URL+image_minified_name+image_jpg );
                                      } else {
                                          callback(500, config.DEFAULT_IMAGE_URL);
                                      }
                            })
                        } else {
                            if (fileExists('public/original_image/' + image_name) == false) {
                                callback(200, url)
                            } else {
                                callback(200, config.CDN_URL + image_minified_name + image_jpg);
                            }
                        }
                    } else {
                        callback(200, config.CDN_URL + 'public/original_image/' + image_name);
                    }
                } else {
                    callback(500, config.DEFAULT_IMAGE_URL);
                }
            });
        }
    } else {
        callback(500, config.DEFAULT_IMAGE_URL);
    }
};