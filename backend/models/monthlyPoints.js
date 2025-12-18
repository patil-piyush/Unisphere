const mongoose = require("mongoose");

const monthlyPointsSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  month: {
    type: Number, // 0 - 11
    required: true
  },

  year: {
    type: Number,
    required: true
  },

  points: {
    type: Number,
    default: 0
  }

}, { timestamps: true });

// One record per user per month
monthlyPointsSchema.index(
  { user_id: 1, month: 1, year: 1 },
  { unique: true }
);

module.exports = mongoose.model("MonthlyPoints", monthlyPointsSchema);
