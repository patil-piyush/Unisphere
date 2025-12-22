const AttendanceToken = require("../models/AttendanceToken");
const crypto = require("crypto");
const QRCode = require("qrcode");

const startAttendanceSession = async (req, res) => {
  try {
    const { duration } = req.body;
    const eventId = req.params.eventId;

    if (!duration || duration < 5)
      return res.status(400).json({ message: "Invalid duration" });

    const token = crypto.randomBytes(32).toString("hex");
    const expiration = new Date(Date.now() + duration * 1000);
    const sessionId = crypto.randomUUID();

    await AttendanceToken.create({
      event_id: eventId,
      token,
      expiration,
      duration,
      session_id: sessionId,
      is_active: true
    });

    // generate QR code from token
    const qrCodeImage = await QRCode.toDataURL(token);


    res.status(200).json({
      message: "QR session started",
      qrCode: qrCodeImage,
      expires_in: duration,
      session_id: sessionId
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//auto refresh QR token

const getNextToken = async (req, res) => {
  try {
    const { session_id } = req.query; // 👈 frontend must send this

    if (!session_id) {
      return res.status(400).json({ message: "Session ID required" });
    }

    // Find active session (NOT token)
    const sessionToken = await AttendanceToken.findOne({
      session_id,
      is_active: true
    }).sort({ createdAt: -1 });

    if (!sessionToken) {
      return res.status(404).json({ message: "No active session" });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiration = new Date(
      Date.now() + sessionToken.duration * 1000
    );

    await AttendanceToken.create({
      event_id: sessionToken.event_id,
      token,
      expiration,
      duration: sessionToken.duration,
      session_id: sessionToken.session_id,
      is_active: true
    });

    // Generate QR from token
    const qrCodeImage = await QRCode.toDataURL(token);

    res.status(200).json({
      qrCode: qrCodeImage,
      expires_in: sessionToken.duration
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


module.exports = { startAttendanceSession, getNextToken };
