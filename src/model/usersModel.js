const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  address: {
    type: String,
  },
  profileImage: {
    type: String,
  },
  isDoctor: {
    type: Boolean,
    default: false,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  location: {
    type: {
      type: String,
    },
    coordinates: {
      type: [], // [longitude, latitude]
    },
  },
  specialization: {
    type: [],
  },
  otp: { type: Number },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  patientsTreated: {
    type: Number,
    default: 0,
  },
  biography: {
    type: String,
  },
  numReviews: {
    type: Number,
    default: 0,
  },
  refreshToken: {
    type: String,
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
