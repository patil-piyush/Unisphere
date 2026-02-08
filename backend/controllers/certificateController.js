const Attendance = require("../models/Attendance");

const certificateCredentials = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.userId;

    const attendance = await Attendance.findOne({
      event_id: eventId,
      user_id: userId,
    })
      .populate("user_id", "name")
      .populate("event_id", "title");

    if (!attendance) {
      return res.status(404).json({
        message: "Attendance record not found for this event.",
      });
    }

    res.json({
      message: "Certificate credentials verified.",
      userName: attendance.user_id.name,
      eventName: attendance.event_id.title,
    });
  } catch (error) {
    console.error("Error verifying certificate credentials:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

module.exports = { certificateCredentials };
