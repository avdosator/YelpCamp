const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const { isLoggedIn, isAuthor, validateCampground } = require("../middleware.js");
const campgrounds = require("../controllers/campgrounds.js");

router.get("/", campgrounds.index);

router.get("/new", isLoggedIn, campgrounds.renderNewForm);

// we should also protect this route like this so somebody can't hit this route even if he finds way around form (which is also protected)
router.post("/", isLoggedIn, validateCampground, catchAsync(campgrounds.createCampground));

router.get("/:id", isLoggedIn, catchAsync(campgrounds.showCampground));

router.get("/:id/edit", isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));

router.put("/:id", isLoggedIn, isAuthor, validateCampground, catchAsync(campgrounds.editCampground));

router.delete("/:id", isLoggedIn, catchAsync(campgrounds.deleteCampground));

module.exports = router;