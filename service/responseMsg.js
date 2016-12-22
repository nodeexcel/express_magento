//CALLED WHEN ANY OPERATION SUCCESS FOR RETURN RESPONSE
success = function (res, data) {
    if (data.status == 1) {
        if (data.isRedis) {
            res.set('X-Cache', 'Redis');
            res.json({status: data.status, body: data.data});
            // console.log('---------Response starts-------');
            // console.log({status: status, body: data});
            // console.log('---------Response ends---------');
        } else {
            res.json({status: data.status, body: data.data});
            // console.log('---------Response starts-------');
            // console.log({status: 500, body: data});
            // console.log('---------Response ends---------');
        }
    }
};

//CALLED WHEN ANY OPERATION FAILED FOR RETURN RESPONSE
oops = function (res, data) {
    res.status(500).send(data.toString());
    // console.log('---------Response starts-------');
    // console.log({status: 500, body: data.toString()});
    // console.log('---------Response ends---------');
};