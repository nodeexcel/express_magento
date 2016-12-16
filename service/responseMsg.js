success = function (res, status, data) {
    if (status == 1) {
        res.json({status: status, body: data});
        console.log('---------Response starts-------')
        console.log({status: status, body: data})
        console.log('---------Response ends---------')
    } else {
        res.status(500).send(data);
        console.log('---------Response starts-------')
        console.log({status: 500, body: data})
        console.log('---------Response ends---------')
    }
};

oops = function (res, data) {
    res.status(500).send(data);
    console.log('---------Response starts-------')
    console.log({status: 500, body: data})
    console.log('---------Response ends---------')
};