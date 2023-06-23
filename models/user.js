const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  userType: {
    type: String,
  },
  policy_number: {
    type: String,
  },
  account_name: {
    type: String,
  },
  email: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
  },
  name: {
    type: String,
    required: true,
  },
  city: {
    type: String,
  },
  phone: {
    type: String,
    required: true,
  },
  address: {
    type: String,
  },
  state: {
    type: String,
  },
  zip: {
    type: String,
  },
  dob: {
    type: Date,
  },
});

const User = mongoose.model("User", userSchema);
module.exports = User;
