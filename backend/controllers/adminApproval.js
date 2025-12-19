const Event = require("../models/event");
const Club = require("../models/club");

const { eventRejectedTemplate } = require("../utils/mailTemplate");
const { sendMail } = require("../utils/mailHelper");

const EVENT_STATUS = require("../config/eventStatus");

// ✅ APPROVE EVENT
const approveEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.status === EVENT_STATUS.APPROVED) {
      return res.status(400).json({ message: "Event already approved" });
    }

    event.status = EVENT_STATUS.APPROVED;
    event.approvedAt = new Date();
    event.approvedBy = null; // admin is env-based for now
    event.rejectionReason = null;
    event.rejectionAt = null;

    await event.save();

    res.status(200).json({
      message: "Event approved successfully",
      eventId: event._id
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ❌ REJECT EVENT
const rejectEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { reason } = req.body;

    if (!reason || reason.trim() === "") {
      return res.status(400).json({ message: "Rejection reason is required" });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.status === EVENT_STATUS.REJECTED) {
      return res.status(400).json({ message: "Event already rejected" });
    }

    if (event.status === EVENT_STATUS.APPROVED) {
      return res.status(400).json({ message: "Event already approved" });
    }

    event.status = EVENT_STATUS.REJECTED;
    event.rejectionReason = reason;
    event.rejectionAt = new Date();
    event.approvedAt = null;
    event.approvedBy = null;

    await event.save();

    // 🔔 Send rejection email to club
    const club = await Club.findById(event.club_id);
    if (club?.email) {
      const mail = eventRejectedTemplate(event.title);
      await sendMail(club.email, mail.subject, mail.text);
    }

    res.status(200).json({
      message: "Event rejected successfully",
      eventId: event._id,
      reason
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getPendingEvents = async (req, res) => {
  try {
    const events = await Event.find({
      status: EVENT_STATUS.PENDING
    })
      .populate("club_id", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(events);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  approveEvent,
  rejectEvent,
  getPendingEvents
};
