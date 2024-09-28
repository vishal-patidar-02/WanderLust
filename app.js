const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const flash = require("connect-flash");

const listings = require("./router/listings.js");
const reviews = require("./router/reviews.js");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderLust";

main()
  .then(() => {
    console.log("Connected to DB!");
  })
  .catch((err) => {
    console.log("Not Connected to DB! :", err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

app.get("/", (req, res) => {
  res.send("this is root user");
});

const sessionOptions = {
  secret: "mysupersecretcode",
  resave: false,
  saveUninitialized:true,
  cookie:{
     expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
     maxAge: 7 * 24 * 60 * 60 * 1000,
     httpOnly: true
  }
}

app.use(session(sessionOptions));
app.use(flash());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
})

app.use("/listings", listings); //Listing routes
app.use("/listings/:id/reviews", reviews); //Reviews routes

app.listen(8080, () => {
  console.log("Server is listening to port: 8080");
});

app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found"));
});

app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrongr" } = err;
  res.status(statusCode);
  res.render("error.ejs", { message });
  console.log(err); //for developer to understand fault
});
