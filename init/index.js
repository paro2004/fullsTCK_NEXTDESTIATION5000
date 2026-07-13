const mongoose = require("mongoose");
const initData = require("./data.js")

const listing = require("../models/listing.js")

// MongoDB connection
async function main() {
    await mongoose.connect("mongodb://127.0.0.1:27017/nextdestination");
}

main()
.then(() => {
    console.log("connected with mongoDB database!!");
})
.catch((err) => {
    console.log(err);
});

//initilizing of the data
const initDB = async() => {
   // Check if database already has listings
   const existingListings = await listing.countDocuments({});
   
   if (existingListings > 0) {
       console.log("Database already initialized with " + existingListings + " listings. Skipping reinitialization to preserve existing data.");
       return;
   }
   
   // Only initialize if database is empty
   initData.data = initData.data.map((obj) => ({...obj, owner:"6a45fa240d841a207dda201a"}))
   await listing.insertMany(initData.data); // then we add data from our data file as a object
   console.log("data was initilized!");
}

initDB(); // call the function