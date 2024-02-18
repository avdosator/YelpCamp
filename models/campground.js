const mongoose = require("mongoose");
const Review = require("./review");

const Schema = mongoose.Schema;

const imageSchema = new Schema({
    path: String,
    filename: String
});

imageSchema.virtual("src").get(function () {
    return this.path.substring(57);
})

const campgroundSchema = new Schema({
    title: String,
    price: Number,
    description: String,
    location: String,
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
    images: [imageSchema]
});

campgroundSchema.post("findOneAndDelete", async function (camp) {
    if(camp) {
        const res = await Review.deleteMany({_id: { $in: camp.reviews }});
    }
});

const Campground = mongoose.model("Campground", campgroundSchema);

module.exports = Campground;