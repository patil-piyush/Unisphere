const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true }, // your internal order reference
    provider: { type: String, default: "razorpay" },
    providerOrderId: { type: String, required: true }, // razorpay_order_id
    amount: { type: Number, required: true }, // paise
    currency: { type: String, default: "INR" },
    status: { type: String, enum: ["created", "paid", "failed", "refunded"], default: "created" },
    providerPaymentId: { type: String },
    signature: { type: String },
  },
  { timestamps: true }
);

const Payment = mongoose.model("Payment", PaymentSchema);

module.exports = { Payment };
