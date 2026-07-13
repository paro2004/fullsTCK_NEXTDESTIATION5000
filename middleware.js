const Listing =require("./models/listing")
const Review = require("./models/reviews.js");
const ExpressError = require("./utils/ExpressError.js")
const {listingSchema, reviewSchema}= require("./schema.js")



module.exports.isLoggedIn = (req, res, next) => {
    
    if (!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;
      req.flash("error", "You must be logged in to create listing!");
      return res.redirect("/login");
    }
    next();
};



module.exports.saveRedirectUrl = (req, res, next) => {
    if (req.session && req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
        delete req.session.redirectUrl;
    }
    next();
};



module.exports.isOwner = async (req, res, next) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
      req.flash("error", "Listing not found!");
      return res.redirect("/listing");
    }
    if (!listing.owner.equals(req.user._id)) {
      req.flash("error", "You don't have permission!");
      return res.redirect(`/listing/${id}`);
    }
    next();
};




module.exports.validateListing = (req, res, next) => {
     const { error } = listingSchema.validate(req.body);
     if (error) {
       throw new ExpressError(400, error.details.map((detail) => detail.message).join(", "));
  }
  else{
    next();
  }

};



module.exports.validateReview = (req, res, next) => {
     const { error } = reviewSchema.validate(req.body);
     if (error) {
       throw new ExpressError(400, error.details.map((detail) => detail.message).join(", "));
  }
  else{
    next();
  }

};



module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review) {
      req.flash("error", "Review not found!");
      return res.redirect(`/listing/${id}`);
    }

    if (!req.user) {
      req.flash("error", "You must be signed in to perform that action!");
      return res.redirect(`/listing/${id}`);
    }

    const isAuthor = review.author && review.author.equals && review.author.equals(req.user._id);
    if (!isAuthor) {
      req.flash("error", "You don't have permission to delete the review!");
      return res.redirect(`/listing/${id}`);
    }

    next();
};

