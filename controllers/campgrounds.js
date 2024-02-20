const fs = require("fs");
const path = require("path");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapboxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding( {accessToken: mapboxToken} );
const Campground = require("../models/campground");

const uploadsDir = path.join(__dirname, "..", "public", 'uploads');

const index = async (req, res, next) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds });
}

const renderNewForm = (req, res) => {
    res.render("campgrounds/new");
}

const createCampground = async (req, res, next) => {
    const campground = new Campground(req.body.campground);
    // loop over req.files (uploaded images) and for every image create an object and store it in campground.images
    campground.images = req.files.map(f => ( {path: f.path, filename: f.filename} ));
    campground.author = req.user._id;
    await campground.save();
    req.flash("success", "Successfully created campground!");
    res.redirect(`/campgrounds/${campground.id}`);
}

const showCampground = async (req, res, next) => {
    // a way to use nested populate, populate reviews and then populate author field in reviews (later is populate of author of camp)
    const campground = await Campground.findById(req.params.id).populate({
        path: "reviews",
        populate: {
            path: "author"
        }
    }).populate("author");
    if (!campground) {
        req.flash("error", "Cannot find that campground!");
        res.redirect("/campgrounds");
    } else {
        res.render("campgrounds/show", { campground });
    }
}

const renderEditForm = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash("error", "Cannot find that campground!");
        return res.redirect("/campgrounds");
    }
    res.render("campgrounds/edit", { campground });
}

const editCampground = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground }, { new: true }); // we should  just use update because we already found campground above
    const images = req.files.map(f => ( {path: f.path, filename: f.filename} ));
    await campground.images.push(...images);
    campground.save();
    if (req.body.deleteImages) {
        for (const image of req.body.deleteImages) {
            const imagePath = path.join(uploadsDir, image);
            fs.unlink(imagePath, (err) => {
                if (err) return next(err);
            })
        }
        // delete from images array images which filename is in req.body.deleteImages (checked images in edit form)
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });
    }
    req.flash("success", "Successfully updated campground!");
    res.redirect(`/campgrounds/${campground._id}`);
}

const deleteCampground = async (req, res, next) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash("success", "Successfully deleted campground!");
    res.redirect("/campgrounds");
}

module.exports = {
    index,
    renderNewForm,
    createCampground,
    showCampground,
    renderEditForm,
    editCampground,
    deleteCampground
}