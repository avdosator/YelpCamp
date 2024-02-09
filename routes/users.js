const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/user");
const catchAsync = require("../utils/catchAsync");

router.get("/register", (req, res) => {
    res.render("users/register");
});

router.post("/register", catchAsync(async(req, res) => {
    try {
        const { username, email, password} = req.body;
        const user = new User({ username, email });
        const registeredUser = await User.register(user, password);
        req.flash("success", "Welcome to Yelp Camp!");
        res.redirect("/campgrounds");
    } catch(e) {
        req.flash("error", e.message);
        res.redirect("/register");
    }
}));

router.get("/login", (req, res) => {
    res.render("users/login");
});

// this middleware is automatically doing authentication with provided (local) strategy - username and password. That is something like hash and compare methods from bcrypt
router.post("/login", passport.authenticate("local", {failureFlash: true, failureRedirect: "/login"} ), (req, res) => {
    req.flash("success", "You are logged in!");
    res.redirect("/campgrounds");
});

router.get("/logout", (req, res, next) => {
    req.logout((err) => {
        if(err) {
            return next(err);
        }
        req.flash("success", "You logged out! Goodbye!");
        res.redirect("/campgrounds");
    });
});

module.exports = router;