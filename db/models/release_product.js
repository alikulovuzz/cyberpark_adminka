const mongoose = require("mongoose");


const releaseProductSchema = new mongoose.Schema({
  kind_of_activity: String,
  OKED: String,
  year:String,
  quarter:String,
  month_1:String,
  month_2:String,
  month_3:String
}, { timestamps: true });

module.exports = mongoose.model("ReleaseProduct", releaseProductSchema);