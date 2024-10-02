const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");

const listingControllers = require("../controllers/listings.js");

//index Route
router.get("/", wrapAsync(listingControllers.index));

//New route
router.get("/new", isLoggedIn, listingControllers.renderNewForm);

//Create Route
router.post(
  "/",
  isLoggedIn,
  validateListing,
  wrapAsync(listingControllers.createListing)
);

//Show route
router.get("/:id", wrapAsync(listingControllers.showListing));

//edit route
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingControllers.renderEditForm)
);

//Update route
router.put(
  "/:id",
  isLoggedIn,
  isOwner,
  validateListing,
  wrapAsync(listingControllers.updateListing)
);

//delete route
router.delete(
  "/:id",
  isLoggedIn,
  isOwner,
  wrapAsync(listingControllers.destroyListing)
);

module.exports = router;
