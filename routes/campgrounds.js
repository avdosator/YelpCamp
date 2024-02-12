const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const { isLoggedIn, isAuthor, validateCampground } = require("../middleware.js");

const Campground = require("../models/campground");

router.get("/", async (req, res, next) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds });
});

router.get("/new", isLoggedIn, (req, res) => {
    res.render("campgrounds/new");
});

// we should also protect this route like this so somebody can't hit this route even if he finds way around form (which is also protected)
router.post("/", isLoggedIn, validateCampground, catchAsync(async (req, res, next) => {
    const campground = new Campground(req.body.campground);
    campground.author = req.user._id;
    await campground.save();
    req.flash("success", "Successfully created campground!");
    res.redirect(`/campgrounds/${campground.id}`);
}));

router.get("/:id", isLoggedIn, catchAsync(async (req, res, next) => {
    const campground = await Campground.findById(req.params.id).populate("reviews").populate("author");
    if (!campground) {
        req.flash("error", "Cannot find that campground!");
        res.redirect("/campgrounds");
    } else {
        res.render("campgrounds/show", { campground });
    }
}));

router.get("/:id/edit", isLoggedIn, isAuthor, catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash("error", "Cannot find that campground!");
        return res.redirect("/campgrounds");
    }
    res.render("campgrounds/edit", { campground });
}));

router.put("/:id", isLoggedIn, isAuthor, validateCampground, catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground }, { new: true }); // we should  just use update because we already found campground above
    req.flash("success", "Successfully updated campground!");
    res.redirect(`/campgrounds/${campground._id}`);
}));

router.delete("/:id", isLoggedIn, catchAsync(async (req, res, next) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash("success", "Successfully deleted campground!");
    res.redirect("/campgrounds");
}));

module.exports = router;