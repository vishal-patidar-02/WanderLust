const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");

const listingControllers = require("../controllers/listings.js");

router
  .route("/")
  .get(wrapAsync(listingControllers.index)) //index Route
  .post(
    //Create Route
    isLoggedIn,
    validateListing,
    wrapAsync(listingControllers.createListing)
  );

//New route
router.get("/new", isLoggedIn, listingControllers.renderNewForm);

router
  .route("/:id")
  .get(wrapAsync(listingControllers.showListing)) //Show route
  .put(
    //Update route
    isLoggedIn,
    isOwner,
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
