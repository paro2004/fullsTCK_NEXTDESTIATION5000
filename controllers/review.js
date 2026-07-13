const mongoose = require("mongoose");
const ExpressError = require("../utils/ExpressError")
const Listing = require("../models/listing")
const Review = require("../models/reviews")

module.exports.postReview = async(req, res) => {
  let listing = await Listing.findById(req.params.id)
  let newReview = new Review(req.body.review)
  newReview.author = req.user._id;
  listing.reviews.push(newReview)

  await newReview.save();
  await listing.save();

  console.log("new review saved");
  req.flash("success", "new review added!");
  res.redirect(`/listing/${listing._id}`)
}


module.exports.destroyReview = async (req, res) => {
  const { id, reviewId } = req.params;
  console.log('DELETE review route hit', { id, reviewId });
  // validate ids
  if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(reviewId)) {
    throw new ExpressError(400, "Invalid id");
  }
  const listing = await Listing.findById(id);
  if (!listing) {
    throw new ExpressError(404, "Listing not found");
  }


// remove reference from listing.reviews
  listing.reviews = listing.reviews.filter(rId => String(rId) !== String(reviewId));
  await listing.save();

  // delete the review document
  await Review.findByIdAndDelete(reviewId);
  req.flash("success","review deleted!");
  res.redirect(`/listing/${id}`);
}


module.exports.fallbackSupport = async (req, res) => {
  const { id, reviewId } = req.params;
  console.log('POST fallback for review delete', { id, reviewId });
  if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(reviewId)) {
    throw new ExpressError(400, "Invalid id");
  }
  const listing = await Listing.findById(id);
  if (!listing) {
    throw new ExpressError(404, "Listing not found");
  }
  listing.reviews = listing.reviews.filter(rId => String(rId) !== String(reviewId));
  await listing.save();
  await Review.findByIdAndDelete(reviewId);
  req.flash("success","review deleted!");
  res.redirect(`/listing/${id}`);
}