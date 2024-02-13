const express = require("express");
const router = express.Router({mergeParams: true}); // now we can use params from different files (campground id)
const catchAsync = require("../utils/catchAsync");
const { isLoggedIn, validateReview, isReviewAuthor } = require("../middleware");

const reviews = require("../controllers/reviews");

const Review = require("../models/review");
const Campground = require("../models/campground");

router.post("/", isLoggedIn, validateReview, catchAsync(reviews.createReview));

router.delete("/:reviewId", isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));

module.exports = router;