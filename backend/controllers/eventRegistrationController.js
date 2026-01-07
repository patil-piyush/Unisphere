const crypto = require("crypto");
const Razorpay = require("razorpay");
const Event = require("../models/Event");
const EventRegistration = require("../models/EventRegistration");
const EventWaitlist = require("../models/EventWaitlist");
const Payment = require("../models/Payment");
const User = require("../models/User");
const {
  sendRegistrationEmail,
  sendWaitingEmail,
  sendPromotionEmail
} = require("../utils/mailHelper");

// Razorpay provider init
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const registerForEvent = async (req, res) => {
  try {
    const user_id = req.userId;
    const event_id = req.params.eventId;

    const user = await User.findById(user_id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const event = await Event.findById(event_id).populate("club_id", "name email");
    if (!event) return res.status(404).json({ message: "Event not found" });

    if (event.isClosed) {
      return res.status(400).json({ message: "Registrations are closed" });
    }

    const alreadyRegistered = await EventRegistration.findOne({ event_id, user_id });
    if (alreadyRegistered) {
      return res.status(409).json({ message: "Already registered" });
    }

    // Free event → instant enrollment, seat increment allowed
    if (event.price === 0) {
      const updatedEvent = await Event.findOneAndUpdate(
        { _id: event_id, registeredCount: { $lt: event.max_capacity } },
        { $inc: { registeredCount: 1 } },
        { new: true }
      );

      if (!updatedEvent) {
        await EventRegistration.create({ event_id, user_id });
        await EventWaitlist.create({ event_id, user_id });
        sendWaitingEmail(user, event);
        return res.status(200).json({ status: "waiting", message: "Event full, added to waitlist" });
      }

      await EventRegistration.create({ event_id, user_id });
      await Payment.create({
        event_id,
        user_id,
        amount: 0,
        status: "success",
        transaction_id: "FREE_REG"
      });

      sendRegistrationEmail(user, updatedEvent);

      return res.status(200).json({
        status: "registered",
        message: "Free registration successful"
      });
    }

    // Paid event → DO NOT increment seat, create Razorpay order instead
    const orderId = `ENROLL-${event_id}-${user_id}-${Date.now()}`;

    const rpOrder = await razorpay.orders.create({
      amount: event.price,
      currency: "INR",
      receipt: orderId,
      payment_capture: 1
    });

    await Payment.create({
      event_id,
      user_id,
      orderId,
      provider: "razorpay",
      providerOrderId: rpOrder.id,
      amount: rpOrder.amount,
      currency: "INR",
      status: "created"
    });

    return res.status(200).json({
      status: "payment_pending",
      providerOrderId: rpOrder.id,
      amount: rpOrder.amount,
      enrollmentOrderId: orderId,
      message: "Paid event. Complete payment to confirm enrollment."
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Already registered or waitlisted" });
    }
    res.status(500).json({ error: error.message });
  }
};

const verifyEventPayment = async (req, res) => {
  try {
    const { providerOrderId, providerPaymentId, signature, enrollmentOrderId, eventId } = req.body;
    if (!providerOrderId || !providerPaymentId || !signature || !enrollmentOrderId || !eventId) {
      return res.status(400).json({ message: "Missing payment verification data" });
    }

    const body = providerOrderId + "|" + providerPaymentId;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== signature) {
      return res.status(400).json({ message: "Payment invalid or tampered" });
    }

    const payment = await Payment.findOneAndUpdate(
      { providerOrderId, orderId: enrollmentOrderId, status: "created" },
      { status: "paid", transaction_id: providerPaymentId, signature },
      { new: true }
    );

    if (!payment) {
      return res.status(404).json({ message: "No matching payment intent found" });
    }

    // Now seat is incremented safely AFTER payment verification
    const event = await Event.findOneAndUpdate(
      { _id: eventId, registeredCount: { $lt: event.max_capacity } },
      { $inc: { registeredCount: 1 } },
      { new: true }
    );

    if (!event) {
      return res.status(400).json({
        message: "Event full, payment verified but seat unavailable. Refund must be issued."
      });
    }

    await EventRegistration.create({ event_id: eventId, user_id: payment.user_id });

    sendRegistrationEmail(await User.findById(payment.user_id), event);

    res.status(200).json({
      status: "registered",
      message: "Enrollment complete, payment verified, seat granted"
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const razorpayWebhook = async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const receivedSignature = req.headers["x-razorpay-signature"];

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (expectedSignature !== receivedSignature) {
      return res.status(400).send("Webhook forged");
    }

    const event = req.body.event;
    if (event === "payment.captured") {
      const providerOrderId = req.body.payload.payment.entity.order_id;
      const providerPaymentId = req.body.payload.payment.entity.id;

      await Payment.updateOne(
        { providerOrderId, status: { $in: ["created", "paid"] } },
        { status: "paid", transaction_id: providerPaymentId }
      );
    }

    res.status(200).send("Webhook processed");

  } catch (error) {
    res.status(500).send("Webhook error");
  }
};

const cancelRegistration = async (req, res) => {
  try {
    const user_id = req.userId;
    const event_id = req.params.eventId;

    const event = await Event.findById(event_id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    const registration = await EventRegistration.findOne({ event_id, user_id });
    if (!registration) {
      return res.status(404).json({ message: "You are not registered for this event" });
    }

    // Remove registration and free the seat
    await EventRegistration.deleteOne({ _id: registration._id });
    await Event.updateOne({ _id: event_id }, { $inc: { registeredCount: -1 } });

    // Mark payment cancelled (refund will be implemented later)
    await Payment.updateOne({ event_id, user_id }, { status: "cancelled" });

    // Promote next user from waitlist if possible
    const nextInQueue = await EventWaitlist.findOne({ event_id }).sort({ createdAt: 1 });

    if (nextInQueue) {
      const promotedEvent = await Event.findOneAndUpdate(
        { _id: event_id, registeredCount: { $lt: event.max_capacity } },
        { $inc: { registeredCount: 1 } },
        { new: true }
      );

      if (promotedEvent) {
        await EventRegistration.create({ event_id, user_id: nextInQueue.user_id });
        await EventWaitlist.deleteOne({ _id: nextInQueue._id });

        const promotedUser = await User.findById(nextInQueue.user_id);
        sendPromotionEmail(promotedUser, promotedEvent);
      }
    }

    return res.status(200).json({ message: "Registration cancelled successfully" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getMyRegisteredEvents = async (req, res) => {
  try {
    const registrations = await EventRegistration.find({ user_id: req.userId }).populate("event_id");
    res.status(200).json(registrations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  registerForEvent,
  verifyEventPayment,
  cancelRegistration,
  getMyRegisteredEvents,
  razorpayWebhook
};
