const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const ejs = require("ejs");
const methodOverride = require("method-override")
const ejsMate = require("ejs-mate");
const wrapAsync = require('./utils/wrapAsync.js')
const ExpressError = require('./utils/ExpressError.js')
const {listingSchema}=require("./schema.js")
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

const validateListing=(req,res,next)=>{
 let {error}=listingSchema.validate(req.body)
    if(error){
      console.log(error.details)
      let errMsg=error.details.map((el)=>el.message).join(",")
      throw new ExpressError(400,errMsg);
    }
    else{
      next();
    }
}

app.get("/", (req, res) => {
  res.send("this is rooooooooot")
})

//1.index route, redirects to show route
app.get("/listing", wrapAsync(async (req, res) => {
  const allListings = await Listing.find({});
  res.render("./listings/index", { allListings });
}))

//3(i).new route(keep this before show route so /new is not mistake as an id 😂)
app.get("/listing/new", wrapAsync(async (req, res) => {
  res.render("./listings/new.ejs");
}))

//3(ii).route to post the new listing
//CREATE ROUTE
app.post("/listing",validateListing,
  wrapAsync(async (req, res, next) => {
 
    let listing = req.body.listing;
   const new_Listing = new Listing(listing)
    await new_Listing.save();
    res.redirect("/listing")



  }))
//2.show route
app.get("/listing/:id", wrapAsync(async (req, res) => {
  let { id } = req.params;
  const each_listing = await Listing.findById(id);
  res.render("./listings/show.ejs", { each_listing });
}))

//4.Edit route
app.get("/listing/:id/edit", wrapAsync(async (req, res) => {
  let { id } = req.params;
  const each_listing = await Listing.findById(id);
  res.render("./listings/edit.ejs", { each_listing });
}))
app.put("/listing/:id",validateListing,  wrapAsync(async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  res.redirect(`/listing/${id}`);
}))
app.delete("/listing/:id", wrapAsync(async (req, res) => {
  let { id } = req.params;
  let deletedList = await Listing.findByIdAndDelete(id);
  console.log(deletedList);
  res.redirect("/listing");
}))
//TO HANDLE UNDE FINED OTHER ROUTES
app.use((req, res, next) => {
  next(new ExpressError(404, 'Page not found'))
})

app.use((err, req, res, next) => {
  let { status = 500, message = 'Something went wrong' } = err
  res.status(status).render("error.ejs",{err})
  //res.status(status).send(message)

})


app.listen(8080, () => {
  console.log("server listening on 8080");
})


