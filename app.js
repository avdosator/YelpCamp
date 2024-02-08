const express = require("express");
const methodOverride = require("method-override");
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const ExpressError = require("./utils/ExpressError");
const User = require("./models/user");


const campgroundRoutes = require("./routes/campgrounds");
const reviewRoutes = require("./routes/reviews");
const userRoutes = require("./routes/users");

mongoose.connect("mongodb://127.0.0.1:27017/yelp-camp");
const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection error!"));
db.once("open", () => console.log("Connected to database!"));

const app = express();

app.set("view engine", "ejs");
app.engine("ejs", ejsMate);
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded( { extended: true}));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public"))); // serve assets from public folder

const sessionConfig = {
    secret: "badsecret",
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + (1000 * 60 * 60 * 24 * 7), // 7 days after now
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig));
app.use(flash());

// PASSWORD SET UP
app.use(passport.initialize()); // adds passport object to the req and allows next routes and middlewares to use passport
// password.session sets up passport to use session for login purposes. When user is authenticated it serialize user to the session
// on next requests it deserialize object from session into req.user
app.use(passport.session()); // needs to be placed after app.use(session())
passport.use(new LocalStrategy(User.authenticate())); // for this local strategy  authenticate method is gonna be on User model (plugin add it) and it generates function for local strategy

passport.serializeUser(User.serializeUser()); // generates a function which is used to serialize user into the session
passport.deserializeUser(User.deserializeUser()); // function which is used to deserialize user 

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});

// fake route to show how creating and registering User works, register() is added to User model by plugin
app.get("/fake", async (req, res) => {
    const user = new User({ username: "avdo", email: "avdo@gmail.com"}); // first create user with all fields except password
    const regUser = await User.register(user, "password"); // then call register with created user and its password
    res.send(regUser); // register hash the pasword and adds a salt field 
})

app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);
app.use("/", userRoutes);


app.all("*", (req, res, next) => {
    next(new ExpressError("Page Not Found!", 404));
})

app.use((err, req, res, next) => {
    const {statusCode = 500} = err;
    if(!err.message) {
        err.message = "Something went wrong";
    }
    res.status(statusCode).render("error", {err});
});

app.listen(3000, () => console.log("Listening on PORT 3000"));