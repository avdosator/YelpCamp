if (process.env.NODE_ENV !== "production") {
    require("dotenv").config()
}

const axios = require("axios");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapboxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapboxToken });
const Campground = require("../models/campground");


const uploadToImgur = async (files) => {
    const imgurClientId = process.env.IMGUR_CLIENT_ID;
    const imgurUrl = process.env.IMGUR_URL;
    const uploadPromises = files.map(file => {
        // Create a new FormData object for each file
        const formData = new FormData();
        const blob = new Blob([file.buffer], { type: file.mimetype });
        formData.append('image', blob, file.originalname); // Assuming 'file.buffer' contains the file data and 'file.originalname' is the filename
        formData.append('type', 'image');
        formData.append('title', file.filename);
        formData.append('description', 'This is a simple image upload in Imgur');

        // Axios POST request with FormData
        return axios.post(imgurUrl, formData, {
            headers: {
                'Content-Type': 'multipart/form-data', // Spread operator to include FormData generated headers
                'Authorization': `Client-ID ${imgurClientId}`
            }
        })
            .then(response => { return { path: response.data.data.link, filename: response.data.data.title, deleteHash: response.data.data.deletehash } })
            .catch(error => console.error('Failed to upload image to Imgur:', error));
    });

    return await Promise.all(uploadPromises);
}

const index = async (req, res, next) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds });
}

const renderNewForm = (req, res) => {
    res.render("campgrounds/new");
}

const createCampground = async (req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send();
    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.body.features[0].geometry;
    // loop over req.files (uploaded images) and for every image create an object and store it in campground.images
    campground.images = await uploadToImgur(req.files);
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
    const images = await uploadToImgur(req.files);
    await campground.images.push(...images);
    await campground.save();
    if (req.body.deleteImages) {
        const imgurClientId = process.env.IMGUR_CLIENT_ID;
        for (const deleteHash of req.body.deleteImages) {
            await axios.delete(`https://api.imgur.com/3/image/${deleteHash}`, {
                headers: { 'Authorization': `Client-ID ${imgurClientId}`, }
            });
        }
        // delete from images array images which filename is in req.body.deleteImages (checked images in edit form)
        await campground.updateOne({ $pull: { images: { deleteHash: { $in: req.body.deleteImages } } } });
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