const Event = require("../models/Event");
const EventRegistration = require("../models/EventRegistration");
const EventWaitlist = require("../models/EventWaitlist");
const User = require("../models/User");
const {
  sendRegistrationEmail,
  sendWaitingEmail,
  sendPromotionEmail
} = require("../utils/mailHelper");

// User registers for event (with waiting list)
const registerForEvent = async (req, res) => {
  try {
    const user_id = req.userId;
    const event_id = req.params.eventId;  // <-- FIXED

    const event = await Event.findById(event_id).populate("club_id", "name email");
    if (!event) return res.status(404).json({ message: "Event not found" });

    if (event.isClosed)
      return res.status(400).json({ message: "Registrations are closed" });

    if (new Date(event.deadline) < new Date())
      return res.status(400).json({ message: "Registration deadline passed" });

    const user = await User.findById(user_id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Check existing registration
    const alreadyRegistered = await EventRegistration.findOne({ event_id, user_id });
    if (alreadyRegistered)
      return res.status(409).json({ message: "Already registered" });

    // Check waitlist
    const alreadyQueued = await EventWaitlist.findOne({ event_id, user_id });
    if (alreadyQueued)
      return res.status(409).json({ message: "Already on waiting list" });

    // If seats are available
    if (event.registeredCount < event.max_capacity) {
      await EventRegistration.create({ event_id, user_id });
      event.registeredCount += 1;
      await event.save();

      sendRegistrationEmail(user, event);
      return res.status(200).json({
        status: "registered",
        message: "Registration successful"
      });
    }

    // Otherwise add to waitlist
    await EventWaitlist.create({ event_id, user_id });
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

// Cancel registration (user) + promote from waitlist
const cancelRegistration = async (req, res) => {
  try {
    const user_id = req.userId;
    const event_id = req.params.eventId;  // <-- FIXED

    const event = await Event.findById(event_id).populate("club_id", "name email");
    if (!event) return res.status(404).json({ message: "Event not found" });

    const registration = await EventRegistration.findOne({ event_id, user_id });
    if (!registration)
      return res.status(404).json({ message: "You are not registered for this event" });

    await EventRegistration.deleteOne({ _id: registration._id });

    event.registeredCount = Math.max(0, event.registeredCount - 1);
    await event.save();

    // Promote from waitlist if available
    const nextInQueue = await EventWaitlist.findOne({ event_id }).sort({ createdAt: 1 });

    if (nextInQueue) {
      const promotedUser = await User.findById(nextInQueue.user_id);

      await EventRegistration.create({
        event_id,
        user_id: nextInQueue.user_id
      });

      event.registeredCount += 1;
      await event.save();

      await EventWaitlist.deleteOne({ _id: nextInQueue._id });

      sendPromotionEmail(promotedUser, event);
    }

    res.status(200).json({ message: "Registration cancelled" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get events current user is registered for
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
