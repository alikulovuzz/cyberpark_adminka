const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  first_name: {
    type: String,
    required: [true, 'Please, write your name at least'],
    trim: true,
    min: 4,
    max: 50
  },
  last_name: {
    type: String,
    default: null,
    trim: true,
    min: 4,
    max: 50
  },
  father_name: {
    type: String,
    default: null,
    trim: true,
    min: 4,
    max: 50
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
    min: 4
  },
  phone: {
    type: String,
    trim: true,
    lowercase: true,
    unique: true,
    // Validation succeeds! Phone number is defined
    // and fits `DDD-DDD-DDDD`
    // validate: {
    //   validator: function (v) {
    //     return /\d{2}-\d{3}-\d{4}/.test(v);
    //   },
    //   message: props => `${props.value} is not a valid phone number!`
    // },
    // required: [true, 'Admin phone number required'],
    min: 7
  },
  password: {
    type: String,
    required: true,
    trim: true,
    min: 4
  },
  last_login: {
    type: Date,
    default: Date.now
  },
  role: [
    {
      type: String,
      enum: {
        values: ['admin', 'superAdmin','crm'],
        message: '{VALUE} is not supported'
      }
    }
  ],
  status: {
    type: String
  },
}, { timestamps: true });

userSchema.index({ email: 1 }); // schema level

module.exports = mongoose.model("User", userSchema);