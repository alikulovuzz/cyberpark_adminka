const mongoose = require("mongoose");

const companySchema = new mongoose.Schema(
  {
    cn: {
      type: String,
      required: [true, "Please, write your company_name at least"],
      trim: true,
      min: 4,
    },
    organization_name: {
      type: String,
      required: [true, "Please, write your organization_name at least"],
      trim: true,
      min: 4,
    },
    location: {
      type: String,
      // required: [true, 'Please, write your location at least'],
      trim: true,
      min: 4,
    },
    uid: {
      type: String,
      trim: true,
      min: 4,
    },
    businessCategory: {
      type: String,
      // required: [true, 'Please, write your businessCategory at least'],
      trim: true,
      min: 4,
    },
    serialNumber: {
      type: String,
      trim: true,
      min: 4,
    },
    validFrom: {
      type: String,
      trim: true,
      min: 4,
    },
    validTo: {
      type: String,
      trim: true,
      min: 4,
    },
    commonName: {
      type: String,
      // required: [true, 'Please, write your commonName at least'],
      trim: true,
      min: 4,
    },
    organizationFull: {
      type: String,
      // required: [true, 'Please, write your organizationFull at least'],
      trim: true,
      min: 4,
    },
    position: {
      type: String,
      trim: true,
      min: 4,
    },
    pinfl: {
      type: String,
      required: [true],
      trim: true,
      min: 4,
    },
    password: {
      type: String,
      required: true,
      trim: true,
      min: 4
    },
    tin: {
      type: String,
      required: [true],
      trim: true,
      min: 4,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      // unique: true,
      // required: 'Email address is required',
      // validate: [validateEmail, 'Please fill a valid email address'],
      // match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    img_link: {
      type: String,
      default: null,
      trim: true,
      min: 4,
    },
    phone: {
      type: String,
      trim: true,
      lowercase: true,
      // Validation succeeds! Phone number is defined
      // and fits `DDD-DDD-DDDD`
      // validate: {
      //   validator: function (v) {
      //     return /\d{2}-\d{3}-\d{4}/.test(v);
      //   },
      //   message: props => `${props.value} is not a valid phone number!`
      // },
      // min: 7,
    },
    role: {
        type: String,
        default: "company",
        enum: {
          values: ['company', 'resident'],
          message: '{VALUE} is not supported'
        }
      },
    status: {
      type: String,
      default: "noResident",
      enum: {
        values: ["resident", "noResident"],
        message: "{VALUE} is not supported",
      },
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

companySchema.index({ pinfl: 1 }); // schema level

module.exports = mongoose.model("Company_form", companySchema);
