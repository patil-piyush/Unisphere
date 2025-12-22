const mongoose = require("mongoose");

const attendanceTokenSchema = new mongoose.Schema(
  {
    event_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true
    },

    // Unique token embedded inside QR
    token: {
      type: String,
      required: true,
      unique: true
    },

    // Token expiration time (used by TTL index)
    expiration: {
      type: Date,
      required: true,
      index: { expires: 0 } // auto-delete after expiration
    },

    // Validity duration in seconds
    duration: {
      type: Number,
      default: 30
    },

    // Attendance session identifier (future-proof)
    session_id: {
      type: String,
      required: true
    },

    // Allows instant enable/disable of attendance without waiting for TTL
    is_active: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

// Compound index for safety
attendanceTokenSchema.index(
  { event_id: 1, token: 1 },
  { unique: true }
);

module.exports = mongoose.model("AttendanceToken", attendanceTokenSchema);
