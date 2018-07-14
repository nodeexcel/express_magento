success = function (res, status, data) {
    if (status == 1) {
        console.log("ye response msg k status 1 kone pr h**************")

        res.json({
            data: data,
            "status": 1,
            "message": "success"
        });
    } else {

        console.log("ye response msg k status 0 kone pr h**************")
        res.status(500).send(data);
    }
};

oops = function (res, data) {
    res.status(500).send(data);
};