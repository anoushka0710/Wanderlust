const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const listingSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String },
    image: {
        type: String,


        default: "https://unsplash.com/photos/tall-grass-stalks-against-a-clear-blue-sky-rgfjOuPQKOY",
        set: (v) => v === "" ? "https://unsplash.com/photos/tall-grass-stalks-against-a-clear-blue-sky-rgfjOuPQKOY" : v,
    },
    //       image: {
    //     filename: { type: String },
    //     url: {
    //       type: String,
    //       default: "https://www.pexels.com/photo/photo-of-railway-on-mountain-near-houses-1658967/",
    //        set:(v)=>v===""?"https://www.pexels.com/photo/photo-of-railway-on-mountain-near-houses-1658967/":v,
    //     }
    //   },

    price: { type: Number },
    location: { type: String },
    country: { type: String }

})
const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;