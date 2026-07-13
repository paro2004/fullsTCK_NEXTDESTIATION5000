const express = require("express")
const router = express.Router({mergeParams: true}); // it preserv the req.param values from the parent router ..if the parent and the child have conflicting param names, the child value take precedence ... it's default value is "false"....so we have to make it true.
const ExpressError = require("../utils/ExpressError.js")
const Listing = require("../models/listing.js");
const Review = require("../models/reviews.js");
const mongoose = require("mongoose");
const { validateReview, isLoggedIn, isOwner, isReviewAuthor } = require("../middleware.js");


//requirement of controller
const listingController = require("../controllers/review.js")


// wrapAsync helper to catch async errors
const wrapAsync = (fn) => {
  return function (req, res, next) {
    fn(req, res, next).catch(next);
  };
};

//reviews
//post route
router.post("/",isLoggedIn ,validateReview, wrapAsync(listingController.postReview)
);


// delete a review
router.delete("/:reviewId",isLoggedIn, isReviewAuthor, wrapAsync(listingController.destroyReview));



// Fallback: support clients whose method override did not convert POST to DELETE
router.post("/:reviewId", isLoggedIn, isReviewAuthor, wrapAsync(listingController.fallbackSupport))
;


module.exports = router;

