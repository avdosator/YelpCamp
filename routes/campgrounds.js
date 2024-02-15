const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({dest: "uploads/"});
const catchAsync = require("../utils/catchAsync");
const { isLoggedIn, isAuthor, validateCampground } = require("../middleware.js");
const campgrounds = require("../controllers/campgrounds.js");

router.get("/", campgrounds.index);

router.route("/")
    .get(campgrounds.index)
    // we should also protect this route like this so somebody can't hit this route even if he finds way around form (which is also protected)
    //.post(isLoggedIn, validateCampground, catchAsync(campgrounds.createCampground));
    .post(upload.single("image"), (req, res) => {
        console.log(req.body, req.file);
        res.send("multer is working");
    })

router.get("/new", isLoggedIn, campgrounds.renderNewForm);

router.route("/:id")
    .get(isLoggedIn, catchAsync(campgrounds.showCampground))
    .put(isLoggedIn, isAuthor, validateCampground, catchAsync(campgrounds.editCampground))
    .delete(isLoggedIn, catchAsync(campgrounds.deleteCampground));

router.get("/:id/edit", isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));

module.exports = router;