const express = require("express");
const router = express.Router();

const catchAsync = require("../utils/catchAsync");
const { isLoggedIn, isAuthor, validateCampground } = require("../middleware.js");
const campgrounds = require("../controllers/campgrounds.js");
const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({storage: storage});

router.get("/", campgrounds.index);

router.route("/")
    .get(campgrounds.index)
    // we should also protect this route like this so somebody can't hit this route even if he finds way around form (which is also protected)
    .post(isLoggedIn, upload.array("image"), validateCampground, catchAsync(campgrounds.createCampground));

router.get("/new", isLoggedIn, campgrounds.renderNewForm);

router.route("/:id")
    .get(isLoggedIn, catchAsync(campgrounds.showCampground))
    .put(isLoggedIn, isAuthor, upload.array("image"), validateCampground, catchAsync(campgrounds.editCampground))
    .delete(isLoggedIn, catchAsync(campgrounds.deleteCampground));

router.get("/:id/edit", isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));

module.exports = router;