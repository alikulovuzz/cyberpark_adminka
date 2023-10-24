const mongoose = require("mongoose");


const importFundsSchema = new mongoose.Schema({
  name: String,
  unit: String,
  qty:String,
  cost:String,
  acc_description:String,
  residual_value:String
}, { timestamps: true });

module.exports = mongoose.model("ImportFunds", importFundsSchema);