const express = require("express")
const router = express.Router();
const User = require("../models/user")
const wrapAsync = require("../utils/wrapAsync")
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware");


//requirement of controller
const listingController = require("../controllers/user.js")

router.route("/signup")
.get( listingController.renderSignupForm)
.post( wrapAsync(listingController.actualSignup))


router.route("/login")
.get(listingController.renderLoginForm)
.post(
  saveRedirectUrl,
  passport.authenticate("local", { failureRedirect: "/login", failureFlash: true }),
  listingController.actualLogin
);


//logout
router.get("/logout", listingController.logoutProcess)

module.exports = router;
