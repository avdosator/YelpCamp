const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const campgroundSchema = new Schema({
    title: String,
    price: Number,
    description: String,
    location: String,
    image: String
});

const Campground = mongoose.model("Campground", campgroundSchema);

module.exports = Campground;