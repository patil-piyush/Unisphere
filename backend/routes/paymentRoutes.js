const express = require("express");
const clubAuth = require("../middlewares/clubAuthMiddleware");
const { registerForEvent, verifyEventPayment, razorpayWebhook } = require("../controllers/eventRegistrationController");

const router = express.Router();

// Create Razorpay order (for paid event enrollment)
router.post("/events/:eventId/payment/create-order", clubAuth, async (req, res) => {
  req.params.eventId = req.params.eventId;
  return registerForEvent(req, res);
});

// Verify payment and grant seat
router.post("/events/:eventId/payment/verify", clubAuth, async (req, res) => {
  req.body.eventId = req.params.eventId;
  return verifyEventPayment(req, res);
});

// Webhook for async confirmation (keep this, don't remove)
router.post("/webhooks/razorpay", express.json({ limit: "10mb" }), razorpayWebhook);

module.exports = router;