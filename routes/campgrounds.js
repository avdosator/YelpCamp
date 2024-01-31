const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const mongoose = require("mongoose");

const {campgroundSchema} = require("../schemas");

const ExpressError = require("../utils/ExpressError");
const Campground = require("../models/campground");

const validateCampground = (req, res, next) => {
    const {error} = campgroundSchema.validate(req.body); // destructure error from result object
    if(error) {
        const message = error.details.map(el => el.message).join(","); // error.details is array of objects so we map 
        throw new ExpressError(message, 400);                         // over them and make a string of them
    } else {
        next();
    }
}

router.get("/", async (req, res, next) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", {campgrounds});
});

router.get("/new", (req, res) => {
    res.render("campgrounds/new");
});

router.get("/:id/edit", catchAsync(async(req, res, next) => {
    const campground = await Campground.findById(req.params.id);
    if(!campground) {
        req.flash("error", "Cannot find that campground!");
        res.redirect("/campgrounds");
    } else {
        res.render("campgrounds/edit", {campground});
    }
}));

router.post("/", validateCampground, catchAsync(async (req, res, next) => { 
    const campground = new Campground(req.body.campground);
    await campground.save();
    req.flash("success", "Successfully created campground!");
    res.redirect(`/campgrounds/${campground.id}`);
}));

router.put("/:id", validateCampground, catchAsync(async (req, res, next) => {
    const {id} = req.params;
    await Campground.findByIdAndUpdate(id, {...req.body.campground}, {new: true});
    req.flash("success", "Successfully updated campground!");
    res.redirect(`/campgrounds/${req.params.id}`);
}));

router.get("/:id", catchAsync(async (req, res, next) => {
    const campground = await Campground.findById(req.params.id).populate("reviews");
    if(!campground) {
        req.flash("error", "Cannot find that campground!");
        res.redirect("/campgrounds");
    } else {
        res.render("campgrounds/show", {campground});
    }
}));

router.delete("/:id", catchAsync(async (req, res, next) => {
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash("success", "Successfully deleted campground!");
    res.redirect("/campgrounds");
}));

module.exports = router;