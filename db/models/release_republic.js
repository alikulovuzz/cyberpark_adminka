const mongoose = require("mongoose");


const releaseRepublicSchema = new mongoose.Schema({
  kind_of_activity: String,
  OKED: String,
  country:String,
  currency:String,
  year:String,
  quarter:String,
  month_1:String,
  month_2:String,
  month_3:String
}, { timestamps: true });

module.exports = mongoose.model("ReleaseRepublic", releaseRepublicSchema);