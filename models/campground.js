const mongoose = require("mongoose");
const Review = require("./review");

const Schema = mongoose.Schema;
const opts = { toJSON: { virtuals: true } }; // now browser can see virtual methods and can use them

const imageSchema = new Schema({
    _id: {_id: false}, // I think that we don't want every image to have id
    path: String,
    filename: String,
    deleteHash: String
});

const campgroundSchema = new Schema({
    title: String,
    price: Number,
    description: String,
    location: String,
    images: [imageSchema],
    author: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review"
        }
    ],
    geometry: { // this is standardized geoJSON field
        type: {
            type: String,
            enum: ["Point"], // like this we say that type must be string "Point"
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    }
}, opts);

campgroundSchema.virtual("properties.popUpMarkup").get(function () {
    return `<b><a href="/campgrounds/${this._id}">${this.title}<a/><b/> <br> <p>Price: ${this.price}$<p/>`;
});

campgroundSchema.post("findOneAndDelete", async function (camp) {
    if(camp) {
        const res = await Review.deleteMany({_id: { $in: camp.reviews }});
    }
});

const Campground = mongoose.model("Campground", campgroundSchema);

module.exports = Campground;