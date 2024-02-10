const isLoggedIn =  (req, res, next) => {
    if(!req.isAuthenticated()) {
        req.flash("error", "You must be logged in!");
        req.session.returnTo = req.originalUrl; // we store url in session so we can use it later when we log in
        return res.redirect("/login");
    }
    next();
}

// we store returnTo (originalUrl) in locals because when we login passport.authenticate() will delete session
const storeReturnTo = (req, res, next) => {
    if(req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
}

module.exports = {isLoggedIn, storeReturnTo};
