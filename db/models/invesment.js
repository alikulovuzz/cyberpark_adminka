const mongoose = require("mongoose");


const invesmentSchema = new mongoose.Schema({
  volume_of_invest: String,
  org_funds: String,
  borrowed_funds:String,
  grants:String,
  other:String
}, { timestamps: true });

module.exports = mongoose.model("Invesment", invesmentSchema);