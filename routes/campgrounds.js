const express = require("express");
const router = express.Router();
const path = require("path");

const catchAsync = require("../utils/catchAsync");
const { isLoggedIn, isAuthor, validateCampground } = require("../middleware.js");
const campgrounds = require("../controllers/campgrounds.js");
const multer = require("multer");

const uploadDir = path.join(__dirname, "..", "public", 'uploads');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir) // Store uploaded files in the 'uploads' directory
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname)); // Rename uploaded files with timestamp
    }
});

const upload = multer({storage: storage});

router.get("/", campgrounds.index);

router.route("/")
    .get(campgrounds.index)
    // we should also protect this route like this so somebody can't hit this route even if he finds way around form (which is also protected)
    //.post(isLoggedIn, validateCampground, catchAsync(campgrounds.createCampground));
    .post(upload.array("image"), (req, res) => {
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