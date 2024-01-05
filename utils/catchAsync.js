moduel.exports = fn => {
    return function (req, res, next) {
        fn(req, res, next).catch(next); // this is same like we wrote .catch(err => next(err)), express automatically do that for us
    }
}
