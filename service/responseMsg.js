//CALLED WHEN ANY OPERATION SUCCESS FOR RETURN RESPONSE
success = function (res, status, data) {
    if (status == 1) {
        res.json({status: status, body: data});
    } else {
        res.status(500).send(data);
    }
};

//CALLED WHEN ANY OPERATION FAILED FOR RETURN RESPONSE
oops = function (res, data) {
    res.status(500).send(data);
};