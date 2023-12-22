const express = require("express");
const methodOverride = require("method-override");
const path = require("path");

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded( { extended: "true"}));


app.listen(3000, () => console.log("Listening on PORT 3000"));