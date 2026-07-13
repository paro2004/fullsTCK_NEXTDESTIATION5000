const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const Review = require("./reviews.js")

// define schema
const listingSchema = new Schema({

    title: {
        type: String,
        required: true,
    },

    description: {
        type: String,
    },

    image: {
        filename: {
            type: String,
        },

        url: {
            type: String,
        },
    },

    price: {
        type: Number,
    },

    location: {
        type: String,
    },

    country: {
        type: String,
    },

    reviews : [
        {
            type : Schema.Types.ObjectId,
            ref : "Review"
        }
    ],

    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    
    geometry:{
        type: {
            type: String, // Don't do `{ location: { type: String } }`
            enum: ['Point'], // 'location.type' must be 'Point'
            required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
    },

    catagory: {
        type:String,
        enum: ["mountains", "sea Side", "forest", "fram house"]
    }


});

//mongoose middleware for deleting the reviews from the database if listing is deleted
listingSchema.post("findOneAndDelete", async (listing) => {
  if (listing) {
    await Review.deleteMany({ _id: { $in: listing.reviews } });
  }
})

// model creation
const Listing = mongoose.model("Listing", listingSchema);

// export
module.exports = Listing;