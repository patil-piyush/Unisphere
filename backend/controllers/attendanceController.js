const Attendance = require("../models/Attendance");
const AttendanceToken = require("../models/AttendanceToken");
const EventRegistration = require("../models/EventRegistration");
const MonthlyPoints = require("../models/MonthlyPoints");
const { EVENT_ATTENDANCE_POINTS } = require("../config/pointsConfig");
const { getCurrentMonthYear } = require("../config/dateUtils");

/**
 * User scans QR and marks attendance
 * → Points awarded ONLY here
 */
const scanAttendance = async (req, res) => {
  try {
    const userId = req.userId;
    const { token } = req.body;

    // Validate token
    const tokenDoc = await AttendanceToken.findOne({ token });

    if (!tokenDoc)
      return res.status(400).json({ message: "Invalid QR code" });

    if (tokenDoc.expiration < new Date())
      return res.status(400).json({ message: "QR expired" });

    if (!tokenDoc.is_active)
      return res.status(400).json({ message: "Attendance session ended" });

    const eventId = tokenDoc.event_id;

    // Ensure user is registered
    const registration = await EventRegistration.findOne({
      event_id: eventId,
      user_id: userId
    });

    if (!registration)
      return res.status(403).json({ message: "Not registered for this event" });

    // Prevent duplicate attendance
    const existing = await Attendance.findOne({
      event_id: eventId,
      user_id: userId
    });

    if (existing)
      return res.status(409).json({ message: "Attendance already marked" });

    // Mark attendance
    await Attendance.create({
      event_id: eventId,
      user_id: userId,
      check_in_time: new Date()
    });

    // Add monthly points
    const { month, year } = getCurrentMonthYear();

    const monthlyPoints = await MonthlyPoints.findOneAndUpdate(
      { user_id: userId, month, year },
      { $inc: { points: EVENT_ATTENDANCE_POINTS } },
      { upsert: true, new: true }
    );

    res.status(200).json({
      message: "Attendance marked successfully",
      pointsAdded: EVENT_ATTENDANCE_POINTS,
      totalMonthlyPoints: monthlyPoints.points
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Live attendance feed for club
 */
const getLiveAttendance = async (req, res) => {
  try {
    const eventId = req.params.eventId;

    const attendees = await Attendance.find({ event_id: eventId })
      .populate("user_id", "name email")
      .sort({ check_in_time: -1 });

    res.status(200).json(attendees);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  scanAttendance,
  getLiveAttendance
};
