const mongoose = require("mongoose");
const Campground = require("../models/campground");
const Review = require("../models/review");
const cities = require("./cities");
const { descriptors, places } = require("./seedHelpers");

mongoose.connect("mongodb://127.0.0.1:27017/yelp-camp");
const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection error!"));
db.once("open", () => console.log("Connected to database!"));

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDatabase = async () => {
	await Campground.deleteMany({});
	await Review.deleteMany({});
	for (let i = 0; i < 300; i++) {
		const rand1000 = Math.floor(Math.random() * 1000);
		const price = Math.floor((Math.random() * 20) + 10);
		const location = `${cities[rand1000].city}, ${cities[rand1000].state}`;
		const camp = new Campground({
			author: "65c4b8ebdb0fbb642f45604b",
			title: `${sample(descriptors)} ${sample(places)}`,
			location: location,
			geometry: {type: "Point", coordinates: [cities[rand1000].longitude, cities[rand1000].latitude]},
			description: "Lorem ipsum, dolor sit amet consectetur adipisicing elit. In tempore recusandae amet id ipsum suscipit iusto consequuntur nam, repellat veritatis pariatur eaque quam similique ab commodi nostrum ut autem repudiandae.",
			images: [
				{
					path: 'C:\\Users\\Avdo\\Desktop\\workspace - VS Code\\YelpCamp\\public\\uploads\\image-1708107075590.jpg',
					filename: 'image-1708107075590.jpg',
				},
				{
					path: 'C:\\Users\\Avdo\\Desktop\\workspace - VS Code\\YelpCamp\\public\\uploads\\image-1708096913049.jpg',
					filename: 'image-1708096913049.jpg',
				}
			],
			price
		});
		await camp.save();
	}
}

seedDatabase().then(() => {
	mongoose.connection.close();
});

