const User = require("../models/user");

const renderRegisterForm = (req, res) => {
    res.render("users/register");
}

const createUser = async(req, res) => {
    try {
        const { username, email, password} = req.body;
        const user = new User({ username, email });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if(err) return next(err);
            req.flash("success", "Welcome to Yelp Camp!");
            res.redirect("/campgrounds");
        })
    } catch(e) {
        req.flash("error", e.message);
        res.redirect("/register");
    }
}

const renderLoginForm = (req, res) => {
    res.render("users/login");
}

const loginUser = (req, res) => {
    req.flash("success", "You are logged in!");
    // if we failed to pass req.isAuthenticated() then originalUrl will be stored into res.locals.returnTo otherwise it would not exist
    const redirectUrl = res.locals.returnTo || "/campgrounds";
    res.redirect(redirectUrl);
}

const logoutUser = (req, res, next) => {
    req.logout((err) => {
        if(err) {
            return next(err);
        }
        req.flash("success", "You logged out! Goodbye!");
        res.redirect("/campgrounds");
    });
}

module.exports = {
    renderRegisterForm,
    createUser,
    renderLoginForm,
    loginUser,
    logoutUser
}