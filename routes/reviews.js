const express = require("express");
const router = express.Router({mergeParams: true}); // now we can use params from different files (campground id)
const catchAsync = require("../utils/catchAsync");
const { isLoggedIn, validateReview } = require("../middleware");

const Review = require("../models/review");
const Campground = require("../models/campground");

router.post("/", isLoggedIn, validateReview, catchAsync(async(req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.unshift(review);
    await campground.save();
    await review.save();
    req.flash("success", "Successfully created review!");
    res.redirect(`/campgrounds/${campground._id}`);
}));

router.delete("/:reviewId", isLoggedIn, catchAsync(async(req, res) => {
    const { id, reviewId} = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { $pull: {reviews: reviewId} } ); // find campground by id and delete doc with reviewId from reviews array
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Successfully deleted review");
    res.redirect(`/campgrounds/${id}`);
}));

module.exports = router;