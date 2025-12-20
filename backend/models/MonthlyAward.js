const mongoose = require("mongoose");

const monthlyAwardSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  month: {
    type: Number,
    required: true
  },

  year: {
    type: Number,
    required: true
  }

}, { timestamps: true });

// Only one winner per month
monthlyAwardSchema.index(
  { month: 1, year: 1 },
  { unique: true }
);

module.exports = mongoose.model("MonthlyAward", monthlyAwardSchema);
