const mongoose = require("mongoose");
const Campground = require("../models/campground");
const cities = require("./cities");
const {descriptors, places} = require("./seedHelpers");

mongoose.connect("mongodb://127.0.0.1:27017/yelp-camp");
const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection error!"));
db.once("open", () => console.log("Connected to database!"));

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDatabase = async () => {
    await Campground.deleteMany({});
    for(let i = 0; i < 50; i++) {
        const rand1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor((Math.random() * 20) + 10);
        const camp = new Campground({
            title: `${sample(descriptors)} ${sample(places)}`,
            location: `${cities[rand1000].city}, ${cities[rand1000].state}`,
            description: "Lorem ipsum, dolor sit amet consectetur adipisicing elit. In tempore recusandae amet id ipsum suscipit iusto consequuntur nam, repellat veritatis pariatur eaque quam similique ab commodi nostrum ut autem repudiandae.",
            image: "https://images.unsplash.com/photo-1563299796-17596ed6b017?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            price
        });
        await camp.save();
    }
}

seedDatabase().then(() => {
    mongoose.connection.close();
});

