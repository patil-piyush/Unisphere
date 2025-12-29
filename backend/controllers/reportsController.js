const Event = require("../models/Event");
const EventRegistration = require("../models/EventRegistration");
const Attendance = require("../models/Attendance");
const Club = require("../models/Club");
const Badge = require("../models/Badge");
const MonthlyPoints = require("../models/MonthlyPoints");

const { PDFDocument, StandardFonts } = require("pdf-lib");
const { createCanvas } = require("canvas");

const generateReportPDF = async (req, res) => {
  try {
    const { type, month, quarter, year } = req.body;
    if (!type || year == null) {
      return res.status(400).json({ error: "Report type and year required." });
    }

    // Date filter
    let dateFilter = {};
    if (type === "monthly") {
      dateFilter = {
        start_date: { $gte: new Date(year, month, 1), $lt: new Date(year, month + 1, 1) }
      };
    }
    if (type === "quarterly") {
      const q = quarter - 1;
      dateFilter = {
        start_date: { $gte: new Date(year, q * 3, 1), $lt: new Date(year, q * 3 + 3, 1) }
      };
    }
    if (type === "yearly") {
      dateFilter = {
        start_date: { $gte: new Date(year, 0, 1), $lt: new Date(year + 1, 0, 1) }
      };
    }

    const events = await Event.find(dateFilter);
    const totalEvents = events.length;
    const eventIDs = events.map(e => e._id);

    const registrations = await EventRegistration.find({ event_id: { $in: eventIDs } }).populate("user_id");
    const attendance = await Attendance.find({ event_id: { $in: eventIDs } }).populate("user_id");
    const badges = await Badge.find({
      createdAt: { $gte: new Date(year, 0, 1), $lt: new Date(year + 1, 0, 1) }
    });

    const attendancePercentagePerEvent = events.map(event => {
      const attended = attendance.filter(a => a.event_id.toString() === event._id.toString()).length;
      const registered = registrations.filter(r => r.event_id.toString() === event._id.toString()).length;
      return {
        event: event.title,
        attendance: attended,
        registrations: registered,
        percentage: registered ? ((attended / registered) * 100).toFixed(2) : "0.00"
      };
    });

    const topStudents = await MonthlyPoints.aggregate([
      { $match: { year: Number(year) } },
      { $sort: { points: -1 } },
      { $limit: 10 },
      { $lookup: { from: "users", localField: "user_id", foreignField: "_id", as: "user" } },
      { $unwind: "$user" },
      { $project: { student: "$user.name", points: 1, department: "$user.department" } }
    ]);

    const deptBreakdown = {};
    attendance.forEach(a => {
      const dept = a.user_id.department;
      deptBreakdown[dept] = (deptBreakdown[dept] || 0) + 1;
    });

    const mostActiveClubs = await Club.aggregate([
      { $lookup: { from: "events", localField: "_id", foreignField: "club_id", as: "events" } },
      { $project: { name: 1, eventCount: { $size: "$events" } } },
      { $sort: { eventCount: -1 } },
      { $limit: 5 }
    ]);

    const trendData = {
      eventCount: totalEvents,
      totalAttendance: attendance.length,
      totalBadges: badges.length,
      totalPoints: topStudents.reduce((sum, s) => sum + s.points, 0)
    };

    /* ---------- Chart Generation ---------- */
    const canvas = createCanvas(600, 400);
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#000000";
    ctx.font = "18px Arial";
    ctx.fillText("Department Participation", 180, 30);

    const departments = Object.keys(deptBreakdown);
    const values = Object.values(deptBreakdown);

    if (departments.length === 0) {
      ctx.fillText("No attendance data recorded for this period.", 140, 200);
    } else {
      const maxVal = Math.max(...values, 1);
      const barWidth = 400 / departments.length;

      ctx.font = "14px Arial";
      departments.forEach((dept, i) => {
        const barHeight = (values[i] / maxVal) * 250;
        ctx.fillRect(100 + i * barWidth, 350 - barHeight, barWidth - 20, barHeight);
        ctx.fillText(dept, 100 + i * barWidth, 370);
        ctx.fillText(values[i], 100 + i * barWidth, 340 - barHeight);
      });
    }

    const chartImage = canvas.toBuffer("image/png");

    /* ---------- PDF Generation ---------- */
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([900, 700]);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica); // ✅ ANSI-safe font

    page.drawText(`INSTITUTE REPORT (${type.toUpperCase()}) - ${year}`, { x: 50, y: 650, size: 24, font });

    page.drawText(`Total Events Conducted: ${totalEvents}`, { x: 50, y: 610, size: 16, font });
    page.drawText(`Total Registrations: ${registrations.length}`, { x: 50, y: 590, size: 16, font });
    page.drawText(`Total Attendance: ${attendance.length}`, { x: 50, y: 570, size: 16, font });

    page.drawText(`Top 10 Students by Points:`, { x: 50, y: 520, size: 16, font });
    topStudents.forEach((s, i) => {
      page.drawText(`${i + 1}. ${s.student} — ${s.points} pts (${s.department})`, {
        x: 70,
        y: 490 - i * 20,
        size: 14,
        font
      });
    });

    page.drawText(`Most Active Clubs:`, { x: 50, y: 250, size: 16, font });
    mostActiveClubs.forEach((c, i) => {
      page.drawText(`${i + 1}. ${c.name} — ${c.eventCount} events`, {
        x: 70,
        y: 220 - i * 20,
        size: 14,
        font
      });
    });

    const img = await pdfDoc.embedPng(chartImage);
    page.drawImage(img, { x: 450, y: 350, width: 400, height: 300 });

    page.drawText(`Institute Impact Insight:`, { x: 50, y: 320, size: 16, font });
    page.drawText(`${trendData.eventCount} events | ${trendData.totalAttendance} attendance | ${trendData.totalBadges} badges | ${trendData.totalPoints} points`, {
      x: 70,
      y: 290,
      size: 14,
      font
    });

    const pdfBytes = await pdfDoc.save();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=${type}-report-${year}.pdf`);
    return res.send(Buffer.from(pdfBytes));

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

module.exports = { generateReportPDF };
