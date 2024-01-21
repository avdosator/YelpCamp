const mongoose = require("mongoose");
const Review = require("./review");
const Product = require("../../The Web Development Bootcamp - modules/Section 45 - Mongo Relationships With Express/models/product");

const Schema = mongoose.Schema;

const campgroundSchema = new Schema({
    title: String,
    price: Number,
    description: String,
    location: String,
    image: String,
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review"
        }
    ]
});

campgroundSchema.post("findOneAndDelete", async (camp) => {
    if(camp.reviews.length) {
        const res = await Product.deleteMany({_id: { $in: camp.reviews }});
        console.log(res);
    }
});

const Campground = mongoose.model("Campground", campgroundSchema);

module.exports = Campground;