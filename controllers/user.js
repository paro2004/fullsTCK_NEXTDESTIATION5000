const User = require("../models/user")
const express = require("express")
const passport = require("passport");
const wrapAsync = require("../utils/wrapAsync")
const { saveRedirectUrl } = require("../middleware");

module.exports.renderSignupForm = (req, res) => {
    res.render("users/signup.ejs")
}


module.exports.actualSignup = async (req, res) => {
    try{
        let { username, email, password } = req.body;
    const newUser = new User({ email, username });
    const registeredUser = await User.register(newUser, password);
    console.log(registeredUser);
    req.login(registeredUser, (err) => {
        if(err){
            return next(err)
        }
        req.flash("success", `Welcome to Next-Destination! ${username}`);
        res.redirect("/listing");
    })
    
    }catch(e){
        req.flash("error", e.message);
        res.redirect("/signup");
    }
    
}


module.exports.renderLoginForm = (req, res) => {
    res.render("users/login.ejs")
}


module.exports.actualLogin = async (req, res) => {
    req.flash("success", "you are logged in! welcome back to Next-Destination!");
    res.redirect(res.locals.redirectUrl || "/listing");
}


module.exports.logoutProcess = (req, res) => {
    req.logout((err) => {
        if(err){
           return next(err);
        }
        req.flash("success", "you are logged out now!")
        res.redirect("/listing")
    })
    
}
