const mongoose = require("mongoose");

const monthlyUserStatsSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  month: {
    type: Number, // 0–11
    required: true
  },

  year: {
    type: Number,
    required: true
  },

  totalPoints: {
    type: Number,
    default: 0
  },

  badges: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Badge"
  }],

  isStudentOfMonth: {
    type: Boolean,
    default: false
  }

}, { timestamps: true });

monthlyUserStatsSchema.index(
  { user_id: 1, month: 1, year: 1 },
  { unique: true }
);

module.exports = mongoose.model("MonthlyUserStats", monthlyUserStatsSchema);
