const express = require("express");
const router = express.Router();
const passport = require("passport");
const catchAsync = require("../utils/catchAsync");
const { storeReturnTo } = require("../middleware");

const users = require("../controllers/users");

router.route("/register")
    .get(users.renderRegisterForm)
    .post(catchAsync(users.createUser));

router.route("/login")
    .get(users.renderLoginForm)
    // this middleware is automatically doing authentication with provided (local) strategy - username and password. That is something like hash and compare methods from bcrypt
    .post(storeReturnTo, passport.authenticate("local", {failureFlash: true, failureRedirect: "/login"} ), users.loginUser);

router.get("/logout", users.logoutUser);

module.exports = router;