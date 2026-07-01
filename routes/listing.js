const express=require('express');
const router=express.Router();
const Listing = require("../models/listing.js");
const wrapAsync = require('../utils/wrapAsync.js')
const ExpressError = require('../utils/ExpressError.js')
const {listingSchema,reviewSchema}=require("../schema.js")
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
//1.index route, redirects to show route
router.get("/", wrapAsync(async (req, res) => {
  const allListings = await Listing.find({});
  res.render("./listings/index", { allListings });
}))

//3(i).new route(keep this before show route so /new is not mistake as an id )
router.get("/new", wrapAsync(async (req, res) => {
  res.render("./listings/new.ejs");
}))

//3(ii).route to post the new listing
//CREATE ROUTE
router.post("/",validateListing,
  wrapAsync(async (req, res, next) => {
 
    let listing = req.body.listing;
   const new_Listing = new Listing(listing)
    await new_Listing.save();
    req.flash("success","Listing created successfully")
    res.redirect("/listing")



  }))
//2.show route
router.get("/:id", wrapAsync(async (req, res) => {
  let { id } = req.params;
  let each_listing;
  try {
    each_listing = await Listing.findById(id).populate("reviews");
  } catch (err) {
    req.flash("error", "Listing not found");
    return res.redirect("/listing");
  }
  if(!each_listing){
    req.flash("error","Listing not found")
    res.redirect("/listing");
    return;
  }
  res.render("./listings/show.ejs", { each_listing });
}))

//4.Edit route
router.get("/:id/edit", wrapAsync(async (req, res) => {
  let { id } = req.params;
  let each_listing;
  try {
    each_listing = await Listing.findById(id);
  } catch (err) {
    req.flash("error", "Listing not found");
    return res.redirect("/listing");
  }
  if(!each_listing){
    req.flash("error","Listing not found")
    res.redirect("/listing");
    return;
  }
  res.render("./listings/edit.ejs", { each_listing });
}))
router.put("/:id",validateListing,  wrapAsync(async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  req.flash("success","Listing updated successfully")
  res.redirect(`/listing/${id}`);
}))
router.delete("/:id", wrapAsync(async (req, res) => {
  let { id } = req.params;
  let deletedList = await Listing.findByIdAndDelete(id);
  console.log(deletedList);
  req.flash("success","Listing deleted successfully")
  res.redirect("/listing");
}))
module.exports=router;
