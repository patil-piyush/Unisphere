const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  club_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Club",
    required: true,
  },

  clubName: {
    type: String,
    default: "Unknown Club",
  },

  title: {
    type: String,
    required: true,
  },

  description: {
    type: String,
    required: true,
  },

  bannerURL:{
    type: String,
    default: "",
  },

  category: {
    type: String,
    enum: ["Workshop", "Seminar", "Social", "Competition", "Other"],
    default: "Seminar",
  },

  tag: {
    type: [String],
    default: [],
  },

  venue: {
    type: String,
    required: true,
  },

  start_time: {
    type: String,
    required: true,
  },

  start_date: {
    type: Date,
    required: true,
  },

  end_time: {
    type: String,
    required: true,
  },

  end_date: {
    type: Date,
    required: true,
  },

  max_capacity: {
    type: Number,
    required: true,
  },

  registeredCount: {
    type: Number,
    default: 0,
  },

  location_coordinates: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },

  isClosed: {
    type: Boolean,
    default: false,
  },

  price: {
    type: Number,
    default: 0,
  },

  /* EVENT APPROVAL SYSTEM */

  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },

  rejectionReason: {
    type: String,
    default: null,
  },

  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null, // future-proof
  },

  approvedAt: {
    type: Date,
    default: null,
  },

  rejectionAt: {
    type: Date,
    default: null,
  },

}, { timestamps: true });

module.exports = mongoose.model("Event", eventSchema);
