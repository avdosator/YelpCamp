const Review = require("../models/review");
const Campground = require("../models/campground");

const createReview = async(req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.unshift(review);
    await campground.save();
    await review.save();
    req.flash("success", "Successfully created review!");
    res.redirect(`/campgrounds/${campground._id}`);
}

const deleteReview = async(req, res) => {
    const { id, reviewId} = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { $pull: {reviews: reviewId} } ); // find campground by id and delete doc with reviewId from reviews array
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Successfully deleted review");
    res.redirect(`/campgrounds/${id}`);
}

module.exports = { createReview, deleteReview };