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

const campgroundRoutes = require("./routes/campgrounds");

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

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if(error) {
        const msg = error.details.map(el => el.message).join(",");
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

app.use("/campgrounds", campgroundRoutes);

app.delete("/campgrounds/:id/reviews/:reviewId", catchAsync(async(req, res) => {
    const { id, reviewId} = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { $pull: {reviews: reviewId} } ); // find campground by id and delete doc with reviewId from reviews array
    await Review.findByIdAndDelete(reviewId);
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