const mongoose = require("mongoose");

const badgeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  description: {
    type: String
  },

  requiredPoints: {
    type: Number
  },

  isPermanent: {
    type: Boolean,
    default: false
  }

}, { timestamps: true });

module.exports = mongoose.model("Badge", badgeSchema);
