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

const registerForEvent = async (req, res) => {
  try {
    const user_id = req.userId;
    const event_id = req.params.eventId;

    const user = await User.findById(user_id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const event = await Event.findById(event_id).populate("club_id", "name email");
    if (!event) return res.status(404).json({ message: "Event not found" });

    if (event.isClosed)
      return res.status(400).json({ message: "Registrations are closed" });

    // Check existing registration
    const alreadyRegistered = await EventRegistration.findOne({ event_id, user_id });
    if (alreadyRegistered)
      return res.status(409).json({ message: "Already registered" });

    // Try atomic seat increment
    const updatedEvent = await Event.findOneAndUpdate(
      { _id: event_id, isClosed: false, registeredCount: { $lt: event.max_capacity } },
      { $inc: { registeredCount: 1 } },
      { new: true }
    );

    // If seat was locked successfully
    if (updatedEvent) {
      await EventRegistration.create({ event_id, user_id });

      const isFree = user.email.endsWith("@pccoepune.org");

      await Payment.create({
        event_id,
        user_id,
        amount: isFree ? 0 : updatedEvent.price,
        status: "success",
        transaction_id: isFree ? "FREE_REG" : null
      });

      sendRegistrationEmail(user, updatedEvent);

      return res.status(200).json({
        status: "registered",
        message: isFree ? "Free registration successful" : "Registration successful, payment recorded"
      });
    }

    // If full → go to waitlist (no seat increment)
    const waitlisted = await EventWaitlist.create({ event_id, user_id });
    sendWaitingEmail(user, event);

    return res.status(200).json({
      status: "waiting",
      message: "Event full, added to waiting list"
    });

  } catch (error) {
    if (error.code === 11000)
      return res.status(409).json({ message: "Already registered or in waiting list" });

    res.status(500).json({ error: error.message });
  }
};

const cancelRegistration = async (req, res) => {
  try {
    const user_id = req.userId;
    const event_id = req.params.eventId;

    const event = await Event.findById(event_id).populate("club_id", "name email");
    if (!event) return res.status(404).json({ message: "Event not found" });

    const registration = await EventRegistration.findOne({ event_id, user_id });
    if (!registration)
      return res.status(404).json({ message: "You are not registered for this event" });

    // Delete registration
    await EventRegistration.deleteOne({ _id: registration._id });

    // Atomic seat decrement
    await Event.updateOne({ _id: event_id }, { $inc: { registeredCount: -1 } });

    // Update payment status
    await Payment.updateOne({ event_id, user_id }, { status: "released" });

    // Promote from waitlist atomically
    const nextInQueue = await EventWaitlist.findOne({ event_id }).sort({ createdAt: 1 });

    if (nextInQueue) {
      const promotedUser = await User.findById(nextInQueue.user_id);
      const promotedEvent = await Event.findOneAndUpdate(
        { _id: event_id, registeredCount: { $lt: event.max_capacity } },
        { $inc: { registeredCount: 1 } },
        { new: true }
      );

      if (promotedEvent) {
        await EventRegistration.create({ event_id, user_id: nextInQueue.user_id });

        await Payment.create({
          event_id,
          user_id: nextInQueue.user_id,
          amount: 0,
          status: "success",
          transaction_id: "PROMOTED_FREE"
        });

        await EventWaitlist.deleteOne({ _id: nextInQueue._id });
        sendPromotionEmail(promotedUser, promotedEvent);
      }
    }

    return res.status(200).json({ message: "Registration cancelled" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getMyRegisteredEvents = async (req, res) => {
  try {
    const registrations = await EventRegistration.find({ user_id: req.userId })
      .populate("event_id");

    res.status(200).json(registrations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  registerForEvent,
  cancelRegistration,
  getMyRegisteredEvents
};
