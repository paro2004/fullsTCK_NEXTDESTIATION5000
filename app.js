if(process.env.NODE_ENV != "production"){
  require('dotenv').config();
}


const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path")
const methodOverride = require("method-override")
const ejsMate = require("ejs-mate")
const ExpressError = require("./utils/ExpressError.js")
const {listingSchema, reviewSchema}= require("./schema.js")
const Review = require("./models/reviews.js");
const listingsRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const session = require("express-session")
const MongoStore = require('connect-mongo');
const MongoStoreCreate = MongoStore.create || (MongoStore.default && MongoStore.default.create);
const flash = require("connect-flash")
const passport = require("passport")
const passportLocal = require("passport-local");
const User = require("./models/user.js");


app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "utils/views"))
app.use(express.urlencoded({extended: true}))
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



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

const wrapAsync = (fn) => {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};


const atlas_url = process.env.ATLASDB_URL;
// MongoDB connection
async function main() {
    await mongoose.connect(atlas_url);
}


main()
.then(() => {
    console.log("connected with MongoDB database!!");
})
.catch((err) => {
    console.log(err);
});

const port = 3000;


const store = MongoStoreCreate({
  mongoUrl: atlas_url,
  crypto: {
    secret:process.env.SECRET
  },
  touchAfter: 24 * 3600,

})

store.on("error", () => {
  console.log("ERROR IN MONGO SESSION STORE", error)
})

//session and cookie
const sessionOption = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie:{
    expires:Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  }
}



// Root route
//app.get("/", (req, res) => {
    //res.send("root is working");
//});


app.use(session(sessionOption))
app.use(flash());

app.use(passport.initialize());
app.use(passport.session()); 
passport.use(new passportLocal(User.authenticate())); //this authenticate is a static method:
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser()); //this method are also static
//jokhon amra session er jonne user er details k store korte chai tokhon amra "serializeUser" ei method ta use korbo ar jodi amra session theke user er details k delete korte chai then amra "deserilizeUser" method k use korbo.

app.use((req, res, next) => {
  res.locals.successmsg = req.flash("success") || [];
  res.locals.errormsg = req.flash("error") || [];
  res.locals.currUser = req.user;
  res.locals.mapToken = process.env.MAP_TOKEN || "";

  next();
});

/*
app.get("/demouser", async (req, res) => {
  let fakeUser = new User({
    email: "student@gmail.com",
    username: "delta"
  });

  let registeredUser = await User.register(fakeUser, "helloworld");
  res.send(registeredUser);
});
*/

//for listing routes
app.use("/listing", listingsRouter)

//for review routes
app.use("/listing/:id/reviews", reviewsRouter)

//for user route
app.use("/", userRouter)




// Ignore missing favicon requests
app.get('/favicon.ico', (req, res) => res.sendStatus(204));

// catch-all 404 handler for Express 5
app.use((req, res, next) => {
    console.warn(`404 handler: ${req.method} ${req.originalUrl}`);
    next(new ExpressError(404, "Page Not Found!"));
})

//middleware for error handling
app.use((err, req, res, next) => {
  console.error("ERROR HANDLER CALLED", err.name, err.message);
    let statusCode = err.statusCode || 500;
    let message = err.message || "Something went wrong";

    if (err.name === "CastError") {
        statusCode = 400;
        message = `Invalid ${err.path}: ${err.value}`;
    } else if (err.name === "ValidationError") {
        statusCode = 400;
        message = Object.values(err.errors)
            .map((error) => error.message)
            .join(". ");
    }

    console.log("RENDERING ERROR PAGE", statusCode, message);
    res.status(statusCode).render("listing/error", { statusCode, message });
});

// Server
const server = app.listen(port, () => {
    console.log(`server is listening on port ${port}`);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  try {
    server.close(() => process.exit(1));
  } catch (err) {
    console.error('Error closing server after unhandledRejection', err);
    process.exit(1);
  }
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Graceful shutdown for SIGTERM and SIGINT
const gracefulShutdown = (signal) => {
  console.info(`${signal} received. Shutting down gracefully.`);
  server.close(() => {
    console.log('Closed out remaining connections');
    process.exit(0);
  });
  // Force shutdown after 10s
  setTimeout(() => {
    console.error('Could not close connections in time, forcing shutdown');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));