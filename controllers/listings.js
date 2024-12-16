const Listing = require("../models/listing.js");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req, res) => {
  let allListings = await Listing.find();
  res.render("listings/index.ejs", { allListings });
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: { path: "author" },
    })
    .populate("owner");
  if (!listing) {
    req.flash("error", "Listing you requested does't exist!");
    res.redirect("/listings");
  }
  res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res) => {
  let response = await geocodingClient
    .forwardGeocode({
      query: req.body.listing.location,
      limit: 1,
    })
    .send();

  let url = req.file.path;
  let filename = req.file.filename;

  if (req.body.listing.categories) {
    req.body.listing.categories = req.body.listing.categories.split(',').map(category => category.trim());
  }

  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.image = { url, filename };

  newListing.geometry = response.body.features[0].geometry;

  let savedListing = await newListing.save();
  req.flash("success", "New listing Created!");
  res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you requested does't exist!");
    res.redirect("/listings");
  }

  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
  res.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
  if (req.body.listing.categories) {
    req.body.listing.categories = req.body.listing.categories.split(',').map(category => category.trim());
  }
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

  if (req.file) {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
    await listing.save();
  }

  req.flash("success", "Listing Updated!");
  res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing Deleted!");
  res.redirect("/listings");
};


module.exports.search = async (req, res, next) => {
  let { search } = req.query;
  if (!search) {
    req.flash("error", "Please enter a search term");
    res.redirect("/listings");
  }
  try{
     const searchquery = {
      $or: [
        {country: {$regex: search, $options: 'i'}}, //if country
        {location: {$regex: search, $options: 'i'}}, //if location
        {title: {$regex: search, $options: 'i'}}, //if title
        {categories: {$regex: search, $options: 'i'}}, //if categories
      ]
     } 

     let allListings = await Listing.find(searchquery);
     res.render("listings/index.ejs", {allListings});
  } catch(err) {
     req.flash("error", "Something went wrong");
     res.redirect("/listings");
  }

}

module.exports.categoriesListing = async (req, res) => {
  let category = req.query.category;
  if (!category) {
    req.flash("error", "Please enter a category");
    res.redirect("/listings");
  }
  try{
     let allListings = await Listing.find({categories: category});
     res.render("listings/index.ejs", {allListings});
    } catch(err) {
      req.flash("error", "Something went wrong");
      res.redirect("/listings");
    }
}