const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    company: {
      type: String,
      trim: true,
      // unique: true,
      // required: 'Email address is required',
      // validate: [validateEmail, 'Please fill a valid email address'],
      // match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    }, email: {
      type: String,
      trim: true,
      lowercase: true,
      // unique: true,
      // required: 'Email address is required',
      // validate: [validateEmail, 'Please fill a valid email address'],
      // match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    requirements: {
      type: String,
      required: [true, "Please, write your company_name at least"],
      trim: true,
      min: 4,
    },
    application: {
      type: String,
      required: [true, "Please, write your organization_name at least"],
      trim: true,
      min: 4,
    },
    constituent_documents: {
      type: String,
      // required: [true, 'Please, write your location at least'],
      trim: true,
      min: 4,
    },
    description: {
      type: String,
      trim: true,
      min: 4,
    },
    license: {
      type: String,
      // required: [true, 'Please, write your businessCategory at least'],
      trim: true,
      min: 4,
    },
    copy_passport: {
      type: String,
      trim: true,
      min: 4,
    },
    project_description: {
      type: String,
      trim: true,
      min: 4,
    },
    candidate_application: {
      type: String,
      trim: true,
      min: 4,
    },
    business_plan: {
      type: String,
      // required: [true, 'Please, write your commonName at least'],
      trim: true,
      min: 4,
    },
    created_at: {
      type: Date,
      // default: Date.now, // Use the current date and time
    },
    updated_at: {
      type: Date,
      // default: Date.now, // Use the current date and time
    },
  },
  {
    timestamps: false,
    underscored: true,
    // freezeTableName: true,
  }
);

applicationSchema.index({ email: 1 }); // schema level

module.exports = mongoose.model("Application_form", applicationSchema);
