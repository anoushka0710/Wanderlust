const express=require('express');
const router=express.Router({mergeParams:true});//to merge parent route params with child route params
const wrapAsync = require('../utils/wrapAsync.js')
const ExpressError = require('../utils/ExpressError.js')
const {listingSchema,reviewSchema}=require("../schema.js")
const Review=require("../models/reviews.js")
const Listing = require("../models/listing.js");

const validateReview=(req,res,next)=>{
 let {error}=reviewSchema.validate(req.body)
    if(error){
      console.log(error.details)
      let errMsg=error.details.map((el)=>el.message).join(",")
      throw new ExpressError(400,errMsg);
    }
    else{
      next();
    }
}
//POST REVIEW ROUTES
router.post("/", validateReview,wrapAsync(async(req,res)=>{
  console.log("reached review route")

let listing=await Listing.findById(req.params.id);
let newReview=new Review(req.body.review);
listing.reviews.push(newReview);
await newReview.save();
await listing.save()
req.flash("success","Review added successfully")

console.log("new review saved")
res.redirect(`/listing/${listing._id}`);

}))
//DELETE REVIEW ROUTE
router.delete("/:reviewId", wrapAsync(async(req,res)=>{
  let{id,reviewId}=req.params;
  //USE $pull operator to remove the review reference from the listing's reviews array
  await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}})
  //to remove from Review collection 
  await Review.findByIdAndDelete(reviewId);
  req.flash("success","Review deleted successfully")
  res.redirect(`/listing/${id}`);


}))
module.exports=router;