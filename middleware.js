const { campgroundSchema, reviewSchema } = require("./schemas");
const Campground = require("./models/campground");
const ExpressError = require("./utils/ExpressError");

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

const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body); // destructure error from result object
    if (error) {
        const message = error.details.map(el => el.message).join(","); // error.details is array of objects so we map 
        throw new ExpressError(message, 400);                         // over them and make a string of them
    } else {
        next();
    }
}

const isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground.author.equals(req.user._id)) {
        req.flash("error", "You don't have permission to do that!");
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if(error) {
        const msg = error.details.map(el => el.message).join(",");
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

module.exports = {isLoggedIn, storeReturnTo, validateCampground, isAuthor, validateReview};
