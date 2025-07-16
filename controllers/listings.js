const Listing = require("../models/listing");
const ExpressError = require("../utils/ExpressError.js");

//  Geocoding using node-fetch
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

//  INDEX Controller with Filter Support
module.exports.index = async (req, res) => {
  const { category } = req.query;
  let allListings;
  if (category) {
    allListings = await Listing.find({ category });
  } else {
    allListings = await Listing.find({});
  }
  res.render("listings/index.ejs", {
    allListings,
    category: category || "All",
  });
};


// SHOW Route
module.exports.showListing = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner");

  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }

  res.render("listings/show.ejs", { listing });
};

//  RENDER NEW FORM
module.exports.renderNewform = (req, res) => {
  res.render("listings/new.ejs");
};

//  CREATE Listing
module.exports.createListing = async (req, res) => {
  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;

  if (req.file) {
    newListing.image = {
      url: req.file.path,
      filename: req.file.filename,
    };
  }

  const fullLocation = `${req.body.listing.location}, ${req.body.listing.country}`;
  try {
    const geoRes = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${fullLocation}`
    );
    const geoData = await geoRes.json();
    if (geoData[0]) {
      newListing.geometry = {
        type: "Point",
        coordinates: [parseFloat(geoData[0].lon), parseFloat(geoData[0].lat)],
      };
    } else {
      newListing.geometry = { type: "Point", coordinates: [0, 0] };
    }
  } catch (err) {
    console.error("Geocoding failed:", err.message);
    newListing.geometry = { type: "Point", coordinates: [0, 0] };
  }

  await newListing.save();
  req.flash("success", "New Listing Created!");
  res.redirect("/listings");
};

// RENDER EDIT FORM
module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }

  if (listing.image && listing.image.url) {
    listing.image.transformed = listing.image.url.replace(
      "/upload",
      "/upload/h_300,w_250"
    );
  }

  res.render("listings/edit.ejs", { listing });
};

//  UPDATE Listing
module.exports.updateListing = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findByIdAndUpdate(id, req.body.listing, {
    new: true,
    runValidators: true,
  });

  if (req.file) {
    listing.image = {
      url: req.file.path,
      filename: req.file.filename,
    };
  }

  const fullLocation = `${req.body.listing.location}, ${req.body.listing.country}`;
  try {
    const geoRes = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${fullLocation}`
    );
    const geoData = await geoRes.json();
    if (geoData[0]) {
      listing.geometry = {
        type: "Point",
        coordinates: [parseFloat(geoData[0].lon), parseFloat(geoData[0].lat)],
      };
    } else {
      listing.geometry = { type: "Point", coordinates: [0, 0] };
    }
  } catch (err) {
    console.error("Geocoding failed:", err.message);
    listing.geometry = { type: "Point", coordinates: [0, 0] };
  }

  await listing.save();
  req.flash("success", "Listing Updated!");
  res.redirect(`/listings/${id}`);
};

// DELETE Listing
module.exports.deleteListing = async (req, res) => {
  const { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing Deleted!");
  res.redirect("/listings");
};
