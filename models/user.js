const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose").default || require("passport-local-mongoose");


const userSchema = new Schema({
    email:{
        type:String,
        required: true
    }

})

userSchema.plugin(passportLocalMongoose); //passport-local-mongoose k amra plugin er maddhome use kori.

module.exports = mongoose.model("User", userSchema);