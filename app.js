const express = require("express");
const methodOverride = require("method-override");
const path = require("path");
const mongoose = require("mongoose");
const catchAsync = require("./utils/catchAsync");
const {campgroundSchema, reviewSchema} = require("./schemas");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError");
const Campground = require("./models/campground");
const Review = require("./models/review");

mongoose.connect("mongodb://127.0.0.1:27017/yelp-camp");
const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection error!"));
db.once("open", () => console.log("Connected to database!"));

const app = express();

app.set("view engine", "ejs");
app.engine("ejs", ejsMate);
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded( { extended: true}));
app.use(methodOverride("_method"));

const validateCampground = (req, res, next) => {
    const {error} = campgroundSchema.validate(req.body); // destructure error from result object
    if(error) {
        const message = error.details.map(el => el.message).join(","); // error.details is array of objects so we map 
        throw new ExpressError(message, 400);                         // over them and make a string of them
    } else {
        next();
    }
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

app.get("/campgrounds", async (req, res, next) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", {campgrounds});
});

app.get("/campgrounds/new", (req, res) => {
    res.render("campgrounds/new");
});

app.get("/campgrounds/:id/edit", catchAsync(async(req, res, next) => {
    const campground = await Campground.findById(req.params.id);
    res.render("campgrounds/edit", {campground});
}));

app.put("/campgrounds/:id", validateCampground, catchAsync(async (req, res, next) => {
    const {id} = req.params;
    await Campground.findByIdAndUpdate(id, {...req.body.campground}, {new: true});
    res.redirect(`/campgrounds/${req.params.id}`);
}));

app.post("/campgrounds", validateCampground, catchAsync(async (req, res, next) => { 
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground.id}`);
}));

app.get("/campgrounds/:id", catchAsync(async (req, res, next) => {
    const campground = await Campground.findById(req.params.id).populate("reviews");
    res.render("campgrounds/show", {campground});
}));

app.delete("/campgrounds/:id", catchAsync(async (req, res, next) => {
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect("/campgrounds");
}));

app.delete("/campgrounds/:id/reviews/:reviewId", catchAsync(async(req, res) => {
    const { id, reviewId} = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { $pull: {reviews: reviewId} } ); // find campground by id and delete doc with reviewId from reviews array
    await Review.findByIdAndDelete(reviewId);
    campground.save();
    res.redirect(`/campgrounds/${id}`);
}));

app.post("/campgrounds/:id/reviews", validateReview, catchAsync(async(req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.unshift(review);
    await campground.save();
    await review.save();
    res.redirect(`/campgrounds/${campground._id}`);
}));

app.all("*", (req, res, next) => {
    next(new ExpressError("Page Not Found!", 404));
})

app.use((err, req, res, next) => {
    const {statusCode = 500} = err;
    if(!err.message) {
        err.message = "Something went wrong";
    }
    res.status(statusCode).render("error", {err});
});

app.listen(3000, () => console.log("Listening on PORT 3000"));