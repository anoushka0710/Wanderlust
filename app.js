const express = require("express");
const app = express();
const mongoose = require("mongoose");
const session=require("express-session");
const flash = require("connect-flash");
const path = require("path");

const ejs = require("ejs");
const methodOverride = require("method-override")
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const passport = require("passport");
const Localstrategy = require("passport-local");
const User = require("./models/user.js");
const listingRoutes=require("./routes/listing.js")
const reviewRoutes=require("./routes/review.js")
const userRoutes=require("./routes/user.js");

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');

  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}
main().then(() => { console.log("connected to DB") }).catch(err => console.log(err));

app.set("view engine", "ejs"); //enables server-side HTML rendering using EJS
app.set("views", path.join(__dirname, "views")); //tells Express where to find your EJS templates
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"))
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

const sessionOptions={
  secret:"supersecret",resave:false,
  saveUninitialized:true,
  cookie:{
    expires:Date.now()+ 7*24*60*60*1000, //cookie persists for 7 days
    maxAge:7*24*60*60*1000,
    httpOnly:true
  }
}

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize()); //initialize passport for authentication
app.use(passport.session());//create session for user and store it in the cookie. This is required for persistent login sessions.

passport.use(new Localstrategy(User.authenticate()));
passport.serializeUser(User.serializeUser()); //to store information about the user in the session
passport.deserializeUser(User.deserializeUser());//to retrieve the user information from the session

app.use((req,res,next)=>{
  res.locals.success=req.flash("success");
  res.locals.error=req.flash("error");
  next();
});


app.get("/demouser",async(req,res)=>{
  let fakeuser=new User({
    email:"student@gmail.com",
    username:"alpha-student"});

    let registeredUser=await User.register(fakeuser,"helloworld")
    res.send(registeredUser);
})


app.get("/", (req, res) => {
  res.send("this is rooooooooot")
})


app.use("/listing",listingRoutes);
app.use("/listing/:id/reviews",reviewRoutes);
app.use("/",userRoutes);


//TO HANDLE UNDEFINED OTHER ROUTES
app.use((req, res, next) => {
  next(new ExpressError(404, 'Page not found'))
})

app.use((err, req, res, next) => {
  let { status = 500, message = 'Something went wrong' } = err
  res.status(status).render("error.ejs",{err})


})


app.listen(8080, () => {
  console.log("server listening on 8080");
})


