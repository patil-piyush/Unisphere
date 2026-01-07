const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  event_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: true,
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "success", "failed"],
    default: "pending",
  },
  transaction_id: {
    type: String,
    unique: true,
    sparse: true,
    default: null,
  },
  payment_time: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

paymentSchema.index({ event_id: 1, user_id: 1 }, { unique: true });

module.exports = mongoose.model("Payment", paymentSchema);
