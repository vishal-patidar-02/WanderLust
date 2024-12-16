const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");

const listingControllers = require("../controllers/listings.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

router
  .route("/")
  .get(wrapAsync(listingControllers.index)) //index Route
  .post(
    //Create Route
    isLoggedIn,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingControllers.createListing)
  );
//New route
router.get("/new", isLoggedIn, listingControllers.renderNewForm);

router.get("/search", wrapAsync(listingControllers.search)); //search route


router.get("/category", wrapAsync(listingControllers.categoriesListing)); //Category route

router
  .route("/:id")
  .get(wrapAsync(listingControllers.showListing)) //Show route
  .put(
    //Update route
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingControllers.updateListing)
  )
  .delete(isLoggedIn, isOwner, wrapAsync(listingControllers.destroyListing)); //delete route

//edit route
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingControllers.renderEditForm)
);



module.exports = router;
