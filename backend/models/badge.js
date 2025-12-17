const mongoose = require("mongoose");

const badgeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  description: {
    type: String
  },

  iconURL: {
    type: String
  },

  requiredPoints: {
    type: Number,
    required: true
  },

  level: {
    type: Number // for ordering
  }

}, { timestamps: true });

module.exports = mongoose.model("Badge", badgeSchema);
