const express = require ("express")
const router = express.Router()
const mongoose = require("mongoose");
const ExpressError = require("../utils/ExpressError.js")
const {isLoggedIn, isOwner, validateListing} = require("../middleware.js")
const multer = require('multer');
const { storage, isCloudinaryConfigured, diskStorage } = require("../cloudConfig.js")
const upload = multer({ storage });
const localUpload = multer({ storage: diskStorage });


//requirement of controller
const listingController = require("../controllers/listing.js")


// wrapAsync helper to catch async errors
const wrapAsync = (fn) => {
  return function (req, res, next) {
    fn(req, res, next).catch(next);
  };
};

// normalize image helper
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


const uploadImage = (req, res, next) => {
  // try primary upload (Cloudinary when configured)
  upload.single('image')(req, res, function (err) {
    if (!err) return next();
    // if configured to use Cloudinary, attempt a local-disk fallback on transient network/DNS errors
    const msg = (err && err.message) ? err.message : '';
    const isNetworkError = /EAI_AGAIN|ENOTFOUND|ECONNRESET|ETIMEDOUT|ECONNREFUSED/i.test(msg);
    if (isCloudinaryConfigured && isNetworkError) {
      // attempt to save the file locally instead
      localUpload.single('image')(req, res, function (err2) {
        if (err2) {
          return next(new ExpressError(500, `Image upload failed: ${err2.message || 'Unknown error'}`));
        }
        // mark that the file was saved locally so downstream logic can pick correct URL
        req._imageUploadedLocally = true;
        // ensure a consistent url property for later middleware
        if (req.file && !req.file.url) {
          req.file.url = `/uploads/${req.file.filename}`;
        }
        return next();
      });
      return;
    }
    return next(new ExpressError(500, `Image upload failed: ${err.message || 'Unknown error'}`));
  });
};

router.route("/")
  .get(wrapAsync(listingController.index))
  .post(
    isLoggedIn,
    uploadImage,
    (req, res, next) => {
      req.body.listing = req.body.listing || {};
      if (req.file) {
        const uploadedLocally = !!req._imageUploadedLocally;
        const url = uploadedLocally
          ? `/uploads/${req.file.filename}`
          : (req.file.secure_url || req.file.url || req.file.path || '');
        req.body.listing.image = {
          filename: req.file.filename,
          url,
        };
      }
      next();
    },
    validateListing,
    wrapAsync(listingController.createListing)
  )

//new route: for adding new listing
router.get("/new", isLoggedIn, listingController.renderNewForm)

//filter route for category-based listing pages
router.get("/category/:catagory", wrapAsync(listingController.renderCategoryListings))

//update route
router.route("/:id")
.get(wrapAsync(listingController.showListing))
.put(
  isLoggedIn,
  isOwner,
  uploadImage,
  (req, res, next) => {
    req.body.listing = req.body.listing || {};
    if (req.file) {
      const uploadedLocally = !!req._imageUploadedLocally;
      const url = uploadedLocally
        ? `/uploads/${req.file.filename}`
        : (req.file.secure_url || req.file.url || req.file.path || '');
      req.body.listing.image = {
        filename: req.file.filename,
        url,
      };
    }
    next();
  },
  validateListing,
  wrapAsync(listingController.updateListing)
)
.delete(isLoggedIn, isOwner, wrapAsync(listingController.deleteListing))


//edit route
router.get('/:id/edit', isLoggedIn, isOwner, wrapAsync(listingController.editListing));

module.exports = router;