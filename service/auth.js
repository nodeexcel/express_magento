isAuth = function (req, res, next) {
    if (req.body.secret) {
        next();
    } else {
        res.json({status: 0, body: 'Secret Empty'});
    }
};