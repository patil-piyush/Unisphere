const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  event_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: true
  },

  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  check_in_time: {
    type: Date,
    default: Date.now
  }

}, { timestamps: true });

// Prevent duplicate attendance for same event
attendanceSchema.index(
  { event_id: 1, user_id: 1 },
  { unique: true }
);

module.exports = mongoose.model("Attendance", attendanceSchema);
