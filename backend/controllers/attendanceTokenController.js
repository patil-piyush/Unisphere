const AttendanceToken = require("../models/AttendanceToken");
const crypto = require("crypto");

const startAttendanceSession = async (req, res) => {
  try {
    const { duration } = req.body;
    const eventId = req.params.eventId;

    if (!duration || duration < 5)
      return res.status(400).json({ message: "Invalid duration" });

    const token = crypto.randomBytes(32).toString("hex");
    const expiration = new Date(Date.now() + duration * 1000);

    await AttendanceToken.create({
      event_id: eventId,
      token,
      expiration,
      duration
    });

    res.status(200).json({
      message: "QR session started",
      token,
      expires_in: duration
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getNextToken = async (req, res) => {
  try {
    const eventId = req.params.eventId;

    const lastToken = await AttendanceToken.findOne({ event_id: eventId })
      .sort({ createdAt: -1 });

    if (!lastToken)
      return res.status(404).json({ message: "No active session" });

    const token = crypto.randomBytes(32).toString("hex");
    const expiration = new Date(Date.now() + lastToken.duration * 1000);

    await AttendanceToken.create({
      event_id: eventId,
      token,
      expiration,
      duration: lastToken.duration
    });

    res.status(200).json({
      token,
      expires_in: lastToken.duration
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { startAttendanceSession, getNextToken };
