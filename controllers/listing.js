const mongoose = require("mongoose");
const ExpressError = require("../utils/ExpressError")
const Listing = require("../models/listing")
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
if (!mapToken) {
  throw new Error('MAP_TOKEN is not defined. Set MAP_TOKEN in your environment or .env file.');
}
const geocodingClient = mbxGeocoding({ accessToken: mapToken });


const normalizeImage = (image) => {
  if (!image) return { filename: "listingimage", url: "" };
  if (typeof image === "string") {
    const urlMatch = image.match(/url\s*[:=]\s*['"]([^'"]+)['"]/);
    return {
      filename: "listingimage",
      url: urlMatch ? urlMatch[1] : image,
    };
  }
  if (typeof image === "object") {
    let url = image.url || "";
    if (typeof url === "string") {
      const urlMatch = url.match(/url\s*[:=]\s*['"]([^'"]+)['"]/);
      if (urlMatch) url = urlMatch[1];
    }
    return {
      filename: image.filename || "listingimage",
      url,
    };
  }
  return { filename: "listingimage", url: "" };
};

module.exports.index = async (req, res) => {
    const allListing = await Listing.find({});
    res.render("listing/index", { allListing, categoryLabel: undefined });
}

module.exports.renderCategoryListings = async (req, res) => {
  const { catagory } = req.params;
  const normalizedCategory = (catagory || '').toLowerCase().trim();

  const categoryMap = {
    mountain: { value: 'mountains', label: 'Mountain' },
    mountains: { value: 'mountains', label: 'Mountain' },
    'sea-side': { value: 'sea Side', label: 'Sea Side' },
    'sea side': { value: 'sea Side', label: 'Sea Side' },
    sea: { value: 'sea Side', label: 'Sea Side' },
    forest: { value: 'forest', label: 'Forest' },
    'farm-house': { value: 'fram house', label: 'Farm House' },
    'farm house': { value: 'fram house', label: 'Farm House' },
    farm: { value: 'fram house', label: 'Farm House' },
    trending: { value: null, label: 'Trending' },
    experience: { value: null, label: 'Experience' },
    services: { value: null, label: 'Services' },
  };

  const matchedCategory = categoryMap[normalizedCategory];
  const query = matchedCategory?.value ? { catagory: matchedCategory.value } : {};
  const allListing = await Listing.find(query);

  res.render("listing/index", {
    allListing,
    currentCategory: matchedCategory?.value || null,
    categoryLabel: matchedCategory?.label ? `${matchedCategory.label} Listings` : 'All Listings',
  });
}


module.exports.renderNewForm = async(req, res) => {
     res.render("listing/new")
}


module.exports.showListing = async(req, res) => {
  let {id} = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ExpressError(400, `Invalid id: ${id}`);
  }
  const listing = await Listing.findById(id).populate({path:"reviews", populate:{path: "author"}}).populate("owner");
  if (!listing) {
    throw new ExpressError(404, "Listing not found");
  }

  const reviewCount = listing.reviews?.length || 0;
  const averageRating = reviewCount
    ? (listing.reviews.reduce((sum, review) => sum + (review.rating || 0), 0) / reviewCount).toFixed(1)
    : "0.0";

  res.render("listing/show", { listing, averageRating, reviewCount });

}



module.exports.createListing = async (req, res, next) => {
  const response = await geocodingClient.forwardGeocode({
    query: req.body.listing.location,
    limit: 2
  })
    .send();

  const listingData = req.body.listing || {};
  const newListing = new Listing({
    ...listingData,
    image: normalizeImage(listingData.image),
    owner: req.user._id,
  });
  newListing.geometry =  response.body.features[0].geometry;

  const savedListing = await newListing.save();
  console.log("Saved listing:", savedListing);
  req.flash("success", "new listing created!");
  res.redirect("/listing");

}


module.exports.editListing = async (req, res) => {
  let {id} = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ExpressError(400, `Invalid id: ${id}`);
  }
  const listing = await Listing.findById(id);
  if (!listing) {
    throw new ExpressError(404, "Listing not found");
  }

  let originalImageUrl = '';
  if (listing.image && listing.image.url) {
    originalImageUrl = listing.image.url.replace("/upload", "/upload/h_300,w_250,e_blur:170");
  }
  res.render("listing/edit", { listing, originalImageUrl });

}


module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    let updatedListing = req.body.listing || {};
    if (updatedListing.image) {
      updatedListing.image = normalizeImage(updatedListing.image);
    } else {
      delete updatedListing.image;
    }
    await Listing.findByIdAndUpdate(id, updatedListing, {
      new: true,
      runValidators: true,
    });
    req.flash("success", "Listing updated!");
    res.redirect(`/listing/${id}`);
}


module.exports.deleteListing = async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
     req.flash("success",  "listing deleted!");
    res.redirect("/listing");
}