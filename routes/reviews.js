const express = require("express");
const router = express.Router({mergeParams: true}); // now we can use params from different files (campground id)
const mongoose = require("mongoose");
const catchAsync = require("../utils/catchAsync");

const {reviewSchema} = require("../schemas");

const Review = require("../models/review");
const ExpressError = require("../utils/ExpressError");
const Campground = require("../models/campground");

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if(error) {
        const msg = error.details.map(el => el.message).join(",");
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

router.delete("/:reviewId", catchAsync(async(req, res) => {
    const { id, reviewId} = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { $pull: {reviews: reviewId} } ); // find campground by id and delete doc with reviewId from reviews array
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`);
}));

router.post("/", validateReview, catchAsync(async(req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.unshift(review);
    await campground.save();
    await review.save();
    res.redirect(`/campgrounds/${campground._id}`);
}));

module.exports = router;