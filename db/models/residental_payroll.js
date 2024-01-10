const mongoose = require("mongoose");


const residentalPayrollSchema = new mongoose.Schema({
  employees : {Unit:String,period:String},
  part_time: {Unit:String,period:String},
  countforeign:{Unit:String,period:String},
  performing:{Unit:String,period:String},
  fund :{Unit:String,period:String}
}, { timestamps: true });

module.exports = mongoose.model("ResidentalPayroll", residentalPayrollSchema);