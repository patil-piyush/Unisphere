import crypto from "crypto";
import { razorpay } from "../config/razorpay.js";
import { Payment } from "../models/Payment.js";

export const createPayment = async (req, res) => {
  const { orderId, amount } = req.body;
  if (!orderId || !amount) return res.status(400).json({ message: "Weak request. orderId and amount required." });

  const order = await razorpay.orders.create({
    amount: amount * 100, // convert to paise
    currency: "INR",
    receipt: orderId,
  });

  await Payment.create({
    orderId,
    providerOrderId: order.id,
    amount: order.amount,
  });

  res.json({ providerOrderId: order.id, amount: order.amount });
};

export const verifyPayment = async (req, res) => {
  const { providerOrderId, providerPaymentId, signature } = req.body;
  if (!providerOrderId || !providerPaymentId || !signature) return res.status(400).json({ message: "Missing payment proof." });

  const body = providerOrderId + "|" + providerPaymentId;
  const expected = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET).update(body).digest("hex");

  if (expected !== signature) return res.status(400).json({ message: "Signature mismatch. Either tampered or hallucinated success." });

  await Payment.findOneAndUpdate(
    { providerOrderId },
    { status: "paid", providerPaymentId, signature }
  );

  res.json({ message: "Payment verified and marked paid." });
};

export const razorpayWebhook = async (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const shasum = crypto.createHmac("sha256", secret).update(JSON.stringify(req.body)).digest("hex");

  if (shasum !== req.headers["x-razorpay-signature"]) return res.status(400).send("Webhook forged.");

  const event = req.body.event;
  const providerOrderId = req.body.payload.payment.entity.order_id;
  const providerPaymentId = req.body.payload.payment.entity.id;

  await Payment.findOneAndUpdate(
    { providerOrderId },
    { status: "paid", providerPaymentId },
    { upsert: false }
  );

  res.status(200).send("Webhook processed.");
};
