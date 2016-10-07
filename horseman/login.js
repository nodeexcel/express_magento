var Horseman = require('node-horseman');
var phantomjs = require('phantomjs');
var horseman = new Horseman({phantomPath: phantomjs.path});

horseman
        .userAgent('Mozilla/5.0 (Windows NT 6.1; WOW64; rv:27.0) Gecko/20100101 Firefox/27.0')
        .open('http://144.76.34.244:8080/magento/1.9/web/customer/account/login/')
        .type('input[name="login[username]"]', '1234567891')
        .type('input[name="login[password]"]', '123456')
        .click('[name="send"]')
        .waitForNextPage()
        .status()
        .then(function (status) {
            if (status == 200) {
                console.log({status: status, msg: 'login successfull'});
            } else {
                console.log({status: status, msg: 'login failed'});
            }
        })
        .screenshot('big.png')
        .close();
