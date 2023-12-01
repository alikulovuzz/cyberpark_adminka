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
  additional_refs:[{name:String,link:String}],
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
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ReleaseProduct'
  }],
  release_republic: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ReleaseRepublic'
  }],
  invesment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invesment'
  },
  residental_payroll: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ResidentalPayroll'
  },
  import_funds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ImportFunds'
  }],
  kks_payer: {
    type: String,
    default: 'yes',
    enum: {
      values: ['yes', 'no'],
      message: '{VALUE} is not supported'
    }
  },
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
    enum: {
      values: ['Audit', 'Choraklik','Oylik'],
      message: '{VALUE} is not supported'
    }
  }
}, { timestamps: true });


auditSchema.index({ company_id: 1 }); // schema level

module.exports = mongoose.model("Audit", auditSchema);