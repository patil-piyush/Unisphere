const mongoose = require("mongoose");

const seatReservationSchema = new mongoose.Schema({
  event_id: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  expiresAt: { type: Date, required: true, index: { expires: 0 } }, // TTL
  status: { type: String, enum: ["locked", "confirmed", "released"], default: "locked" }
}, { timestamps: true });

seatReservationSchema.index({ event_id: 1, user_id: 1 }, { unique: true });

module.exports = mongoose.model("SeatReservation", seatReservationSchema);
