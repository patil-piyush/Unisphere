const mongoose = require("mongoose");

const studentAwardSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  type: {
    type: String,
    enum: ["STUDENT_OF_MONTH", "STUDENT_OF_YEAR"],
    required: true
  },

  month: Number,
  year: Number,

  points: Number

}, { timestamps: true });

module.exports = mongoose.model("StudentAward", studentAwardSchema);
