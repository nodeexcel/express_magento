success = function (res, status, data) {
    if (status == 1) {
        res.json({status: status, body: data});
    } else {
        res.status(500).send(data);
    }
};

oops = function (res, data) {
    res.status(500).send(data);
};