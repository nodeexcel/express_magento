//CALLED WHEN ANY OPERATION SUCCESS FOR RETURN RESPONSE
success = function (res, data) {
if (data.status == 1) {
        if (data.isRedis) {
            res.set('X-Cache', 'Redis');
            res.json({status: status, body: data});
        } else {
            res.json({status: status, body: data});
        }
    } else {
        res.status(500).send(data);
    }

    // if (status == 1) {
    //     if (resp) {
    //         res.set('X-Cache', 'Redis');
    //         res.json({status: status, body: data});
    //     } else {
    //         res.json({status: status, body: data});
    //     }
    // } else {
    //     res.status(500).send(data);
    // }
};

//CALLED WHEN ANY OPERATION FAILED FOR RETURN RESPONSE
oops = function (res, data) {
    res.status(500).send(data.toString());
};