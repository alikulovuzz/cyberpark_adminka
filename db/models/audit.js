const mongoose = require("mongoose");


const auditSchema = new mongoose.Schema({
  name_of_report: {
    type: String,
    // required: [true, 'Please, write your name_of_report at least'],
    trim: true,
    min: 4
  },
  file_link: {
    type: String,
    trim: true,
    min: 4
  },
  company_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company_form'
  },
  year: {
    type: String,
    default: null,
    trim: true,
    min: 1,
    // max: 8
  },
  quarterly: {
    type: String,
    enum: {
      values: ['first', 'second', 'third', 'fourth'],
      message: '{VALUE} is not supported'
    }
  },
  release_product: [{
    kind_of_activity: String,
    OKED: String,
    year:String,
    quarter:String,
    month_1:String,
    month_2:String,
    month_3:String
  }],
  release_republic: [{
    kind_of_activity: String,
    OKED: String,
    country:String,
    currency:String,
    year:String,
    quarter:String,
    month_1:String,
    month_2:String,
    month_3:String
  }],
  invesment: [{
    volume_of_invest: String,
    org_funds: String,
    borrowed_funds:String,
    grants:String,
    other:String
  }],
  residental_payroll: [{
    employees : {Unit:String,period:String},
    part_time: {Unit:String,period:String},
    countforeign:{Unit:String,period:String},
    performing:{Unit:String,period:String},
    fund :{Unit:String,period:String}
  }],
  import_funds: [{
    name: String,
    unit: String,
    qty:String,
    acc_description:String,
    residual_value:String
  }],
  status: {
    type: String,
    default: 'not_in_progress',
    enum: {
      values: ['disabled', 'progress', 'finished', 'not_in_progress'],
      message: '{VALUE} is not supported'
    }
  },
  type_of_report: {
    type: String,
    default: 'Audit',
    enum: {
      values: ['Audit', 'Choraklik','Oylik'],
      message: '{VALUE} is not supported'
    }
  }
}, { timestamps: true });


auditSchema.index({ company_id: 1 }); // schema level

module.exports = mongoose.model("Audit", auditSchema);