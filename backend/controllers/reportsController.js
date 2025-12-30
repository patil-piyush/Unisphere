const Event = require("../models/Event");
const EventRegistration = require("../models/EventRegistration");
const Attendance = require("../models/Attendance");
const Club = require("../models/Club");
const Badge = require("../models/Badge");
const MonthlyPoints = require("../models/MonthlyPoints");
const User = require("../models/User");

const { PDFDocument, StandardFonts, rgb } = require("pdf-lib");
const { createCanvas } = require("canvas");

// ================== CHART GENERATION UTILITIES ==================

const COLORS = {
  primary: "#4F46E5",
  secondary: "#7C3AED",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
  info: "#3B82F6",
  dark: "#1F2937",
  light: "#F3F4F6",
  chart: [
    "#4F46E5", "#7C3AED", "#EC4899", "#F59E0B", "#10B981",
    "#3B82F6", "#EF4444", "#8B5CF6", "#06B6D4", "#84CC16"
  ]
};

// Helper: Draw rounded rectangle
const drawRoundedRect = (ctx, x, y, width, height, radius) => {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
};

// Generate Bar Chart
const generateBarChart = (data, options = {}) => {
  const {
    width = 500,
    height = 300,
    title = "",
    xLabel = "",
    yLabel = "",
    barColor = COLORS.primary
  } = options;

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // Background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  // Title
  if (title) {
    ctx.fillStyle = COLORS.dark;
    ctx.font = "bold 16px Arial";
    ctx.textAlign = "center";
    ctx.fillText(title, width / 2, 25);
  }

  const labels = Object.keys(data);
  const values = Object.values(data);

  if (labels.length === 0) {
    ctx.fillStyle = "#666";
    ctx.font = "14px Arial";
    ctx.textAlign = "center";
    ctx.fillText("No data available", width / 2, height / 2);
    return canvas.toBuffer("image/png");
  }

  const padding = { top: 50, right: 30, bottom: 60, left: 60 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const maxVal = Math.max(...values, 1);
  const barWidth = Math.min(50, (chartWidth / labels.length) - 10);
  const barGap = (chartWidth - barWidth * labels.length) / (labels.length + 1);

  // Y-axis
  ctx.strokeStyle = "#e5e7eb";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 5; i++) {
    const y = padding.top + (chartHeight / 5) * i;
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(width - padding.right, y);
    ctx.stroke();

    ctx.fillStyle = "#666";
    ctx.font = "12px Arial";
    ctx.textAlign = "right";
    const value = Math.round(maxVal - (maxVal / 5) * i);
    ctx.fillText(value.toString(), padding.left - 10, y + 4);
  }

  // Bars
  labels.forEach((label, i) => {
    const barHeight = (values[i] / maxVal) * chartHeight;
    const x = padding.left + barGap + i * (barWidth + barGap);
    const y = padding.top + chartHeight - barHeight;

    // Bar gradient
    const gradient = ctx.createLinearGradient(x, y, x, y + barHeight);
    gradient.addColorStop(0, COLORS.chart[i % COLORS.chart.length]);
    gradient.addColorStop(1, COLORS.chart[i % COLORS.chart.length] + "99");

    ctx.fillStyle = gradient;
    drawRoundedRect(ctx, x, y, barWidth, barHeight, 4);
    ctx.fill();

    // Value on top
    ctx.fillStyle = COLORS.dark;
    ctx.font = "bold 11px Arial";
    ctx.textAlign = "center";
    ctx.fillText(values[i].toString(), x + barWidth / 2, y - 8);

    // Label
    ctx.fillStyle = "#666";
    ctx.font = "11px Arial";
    ctx.save();
    ctx.translate(x + barWidth / 2, height - padding.bottom + 15);
    ctx.rotate(-0.4);
    ctx.textAlign = "right";
    const displayLabel = label.length > 12 ? label.substring(0, 12) + "..." : label;
    ctx.fillText(displayLabel, 0, 0);
    ctx.restore();
  });

  // Y-axis label
  if (yLabel) {
    ctx.save();
    ctx.translate(15, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = "#666";
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    ctx.fillText(yLabel, 0, 0);
    ctx.restore();
  }

  return canvas.toBuffer("image/png");
};

// Generate Pie Chart
const generatePieChart = (data, options = {}) => {
  const { width = 400, height = 300, title = "" } = options;

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  if (title) {
    ctx.fillStyle = COLORS.dark;
    ctx.font = "bold 16px Arial";
    ctx.textAlign = "center";
    ctx.fillText(title, width / 2, 25);
  }

  const labels = Object.keys(data);
  const values = Object.values(data);
  const total = values.reduce((sum, v) => sum + v, 0);

  if (total === 0) {
    ctx.fillStyle = "#666";
    ctx.font = "14px Arial";
    ctx.textAlign = "center";
    ctx.fillText("No data available", width / 2, height / 2);
    return canvas.toBuffer("image/png");
  }

  const centerX = width / 2 - 60;
  const centerY = height / 2 + 20;
  const radius = Math.min(width, height) / 3;

  let startAngle = -Math.PI / 2;

  labels.forEach((label, i) => {
    const sliceAngle = (values[i] / total) * 2 * Math.PI;
    const endAngle = startAngle + sliceAngle;

    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = COLORS.chart[i % COLORS.chart.length];
    ctx.fill();

    // Add white border
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.stroke();

    startAngle = endAngle;
  });

  // Legend
  const legendX = width - 130;
  let legendY = 50;

  labels.forEach((label, i) => {
    ctx.fillStyle = COLORS.chart[i % COLORS.chart.length];
    ctx.fillRect(legendX, legendY, 12, 12);

    ctx.fillStyle = COLORS.dark;
    ctx.font = "11px Arial";
    ctx.textAlign = "left";
    const percentage = ((values[i] / total) * 100).toFixed(1);
    const displayLabel = label.length > 10 ? label.substring(0, 10) + "..." : label;
    ctx.fillText(`${displayLabel} (${percentage}%)`, legendX + 18, legendY + 10);
    legendY += 22;
  });

  return canvas.toBuffer("image/png");
};

// Generate Line Chart
const generateLineChart = (data, options = {}) => {
  const { width = 500, height = 300, title = "", lines = [] } = options;

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  if (title) {
    ctx.fillStyle = COLORS.dark;
    ctx.font = "bold 16px Arial";
    ctx.textAlign = "center";
    ctx.fillText(title, width / 2, 25);
  }

  const labels = data.labels || [];

  if (labels.length === 0) {
    ctx.fillStyle = "#666";
    ctx.font = "14px Arial";
    ctx.textAlign = "center";
    ctx.fillText("No data available", width / 2, height / 2);
    return canvas.toBuffer("image/png");
  }

  const padding = { top: 50, right: 30, bottom: 50, left: 60 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const allValues = lines.flatMap(line => line.values);
  const maxVal = Math.max(...allValues, 1);

  // Grid lines
  ctx.strokeStyle = "#e5e7eb";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 5; i++) {
    const y = padding.top + (chartHeight / 5) * i;
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(width - padding.right, y);
    ctx.stroke();

    ctx.fillStyle = "#666";
    ctx.font = "12px Arial";
    ctx.textAlign = "right";
    ctx.fillText(Math.round(maxVal - (maxVal / 5) * i).toString(), padding.left - 10, y + 4);
  }

  // X-axis labels
  const xStep = chartWidth / (labels.length - 1 || 1);
  labels.forEach((label, i) => {
    const x = padding.left + i * xStep;
    ctx.fillStyle = "#666";
    ctx.font = "11px Arial";
    ctx.textAlign = "center";
    ctx.fillText(label, x, height - padding.bottom + 20);
  });

  // Draw lines
  lines.forEach((line, lineIndex) => {
    ctx.strokeStyle = COLORS.chart[lineIndex % COLORS.chart.length];
    ctx.lineWidth = 3;
    ctx.beginPath();

    line.values.forEach((value, i) => {
      const x = padding.left + i * xStep;
      const y = padding.top + chartHeight - (value / maxVal) * chartHeight;

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });

    ctx.stroke();

    // Draw points
    line.values.forEach((value, i) => {
      const x = padding.left + i * xStep;
      const y = padding.top + chartHeight - (value / maxVal) * chartHeight;

      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fillStyle = COLORS.chart[lineIndex % COLORS.chart.length];
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  });

  // Legend
  let legendX = padding.left;
  lines.forEach((line, i) => {
    ctx.fillStyle = COLORS.chart[i % COLORS.chart.length];
    ctx.fillRect(legendX, height - 15, 12, 12);
    ctx.fillStyle = COLORS.dark;
    ctx.font = "11px Arial";
    ctx.textAlign = "left";
    ctx.fillText(line.label, legendX + 16, height - 5);
    legendX += ctx.measureText(line.label).width + 40;
  });

  return canvas.toBuffer("image/png");
};

// Generate Stats Card
const generateStatsCard = (stats, options = {}) => {
  const { width = 700, height = 200 } = options;

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  const cardWidth = (width - 50) / stats.length - 15;
  const cardHeight = 140;

  stats.forEach((stat, i) => {
    const x = 25 + i * (cardWidth + 15);
    const y = 30;

    // Card background with gradient
    const gradient = ctx.createLinearGradient(x, y, x, y + cardHeight);
    gradient.addColorStop(0, stat.color || COLORS.primary);
    gradient.addColorStop(1, (stat.color || COLORS.primary) + "DD");

    ctx.fillStyle = gradient;
    drawRoundedRect(ctx, x, y, cardWidth, cardHeight, 12);
    ctx.fill();

    // Icon background
    ctx.fillStyle = "rgba(255,255,255,0.2)";
    ctx.beginPath();
    ctx.arc(x + cardWidth - 35, y + 35, 25, 0, Math.PI * 2);
    ctx.fill();

    // Value
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 32px Arial";
    ctx.textAlign = "left";
    ctx.fillText(stat.value.toLocaleString(), x + 20, y + 60);

    // Label
    ctx.font = "14px Arial";
    ctx.fillText(stat.label, x + 20, y + 90);

    // Subtitle/change
    if (stat.subtitle) {
      ctx.font = "12px Arial";
      ctx.fillStyle = "rgba(255,255,255,0.8)";
      ctx.fillText(stat.subtitle, x + 20, y + 115);
    }
  });

  return canvas.toBuffer("image/png");
};

// Generate Table Image
const generateTableImage = (headers, rows, options = {}) => {
  const { width = 700, title = "" } = options;
  const rowHeight = 35;
  const headerHeight = 45;
  const titleHeight = title ? 40 : 0;
  const height = titleHeight + headerHeight + rows.length * rowHeight + 20;

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  let currentY = 10;

  // Title
  if (title) {
    ctx.fillStyle = COLORS.dark;
    ctx.font = "bold 16px Arial";
    ctx.textAlign = "center";
    ctx.fillText(title, width / 2, currentY + 20);
    currentY += titleHeight;
  }

  const colWidth = (width - 40) / headers.length;

  // Header background
  ctx.fillStyle = COLORS.primary;
  drawRoundedRect(ctx, 20, currentY, width - 40, headerHeight, 8);
  ctx.fill();

  // Header text
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 13px Arial";
  ctx.textAlign = "center";
  headers.forEach((header, i) => {
    ctx.fillText(header, 20 + colWidth * i + colWidth / 2, currentY + 28);
  });

  currentY += headerHeight;

  // Rows
  rows.forEach((row, rowIndex) => {
    // Alternating row colors
    ctx.fillStyle = rowIndex % 2 === 0 ? "#f9fafb" : "#ffffff";
    ctx.fillRect(20, currentY, width - 40, rowHeight);

    // Row data
    ctx.fillStyle = COLORS.dark;
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    row.forEach((cell, colIndex) => {
      const displayText = String(cell).length > 20 
        ? String(cell).substring(0, 20) + "..." 
        : String(cell);
      ctx.fillText(displayText, 20 + colWidth * colIndex + colWidth / 2, currentY + 22);
    });

    currentY += rowHeight;
  });

  // Border
  ctx.strokeStyle = "#e5e7eb";
  ctx.lineWidth = 1;
  drawRoundedRect(ctx, 20, titleHeight + 10, width - 40, height - titleHeight - 20, 8);
  ctx.stroke();

  return canvas.toBuffer("image/png");
};

// ================== MAIN REPORT GENERATOR ==================

const generateReportPDF = async (req, res) => {
  try {
    const { type, month, quarter, year } = req.body;

    if (!type || year == null) {
      return res.status(400).json({ error: "Report type and year required." });
    }

    // ========== DATE FILTER SETUP ==========
    let dateFilter = {};
    let periodLabel = "";

    if (type === "monthly") {
      const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];
      dateFilter = {
        start_date: { $gte: new Date(year, month, 1), $lt: new Date(year, month + 1, 1) }
      };
      periodLabel = `${monthNames[month]} ${year}`;
    }
    if (type === "quarterly") {
      const q = quarter - 1;
      dateFilter = {
        start_date: { $gte: new Date(year, q * 3, 1), $lt: new Date(year, q * 3 + 3, 1) }
      };
      periodLabel = `Q${quarter} ${year}`;
    }
    if (type === "yearly") {
      dateFilter = {
        start_date: { $gte: new Date(year, 0, 1), $lt: new Date(year + 1, 0, 1) }
      };
      periodLabel = `Year ${year}`;
    }

    // ========== DATA FETCHING ==========
    const [events, clubs, allBadges, users] = await Promise.all([
      Event.find(dateFilter).populate("club_id"),
      Club.find({}),
      Badge.find({
        createdAt: { $gte: new Date(year, 0, 1), $lt: new Date(year + 1, 0, 1) }
      }),
      User.find({ role: "student" })
    ]);

    const eventIDs = events.map(e => e._id);

    const [registrations, attendance] = await Promise.all([
      EventRegistration.find({ event_id: { $in: eventIDs } }).populate("user_id"),
      Attendance.find({ event_id: { $in: eventIDs } }).populate("user_id")
    ]);

    // Get category-wise breakdown
    const categoryBreakdown = {};
    events.forEach(event => {
      const category = event.category || "Uncategorized";
      if (!categoryBreakdown[category]) {
        categoryBreakdown[category] = { events: 0, attendance: 0, registrations: 0 };
      }
      categoryBreakdown[category].events++;
    });

    attendance.forEach(a => {
      const event = events.find(e => e._id.toString() === a.event_id.toString());
      if (event) {
        const category = event.category || "Uncategorized";
        if (categoryBreakdown[category]) {
          categoryBreakdown[category].attendance++;
        }
      }
    });

    registrations.forEach(r => {
      const event = events.find(e => e._id.toString() === r.event_id.toString());
      if (event) {
        const category = event.category || "Uncategorized";
        if (categoryBreakdown[category]) {
          categoryBreakdown[category].registrations++;
        }
      }
    });

    // Club-wise data
    const clubWiseData = clubs.map(club => {
      const clubEvents = events.filter(e => 
        e.club_id && e.club_id._id.toString() === club._id.toString()
      );
      const clubEventIds = clubEvents.map(e => e._id.toString());
      const clubAttendance = attendance.filter(a => 
        clubEventIds.includes(a.event_id.toString())
      ).length;
      const clubRegistrations = registrations.filter(r => 
        clubEventIds.includes(r.event_id.toString())
      ).length;

      return {
        name: club.name,
        events: clubEvents.length,
        attendance: clubAttendance,
        registrations: clubRegistrations,
        avgAttendance: clubRegistrations > 0 
          ? ((clubAttendance / clubRegistrations) * 100).toFixed(1) 
          : 0
      };
    }).sort((a, b) => b.events - a.events);

    // Department breakdown
    const deptBreakdown = {};
    attendance.forEach(a => {
      if (a.user_id && a.user_id.department) {
        const dept = a.user_id.department;
        deptBreakdown[dept] = (deptBreakdown[dept] || 0) + 1;
      }
    });

    // Top students
    const topStudents = await MonthlyPoints.aggregate([
      { $match: { year: Number(year) } },
      { $group: { _id: "$user_id", totalPoints: { $sum: "$points" } } },
      { $sort: { totalPoints: -1 } },
      { $limit: 10 },
      { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "user" } },
      { $unwind: "$user" },
      { $project: { 
        name: "$user.name", 
        points: "$totalPoints", 
        department: "$user.department",
        email: "$user.email"
      }}
    ]);

    // Monthly trend data (for line chart)
    const monthlyTrend = [];
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    for (let m = 0; m < 12; m++) {
      const monthStart = new Date(year, m, 1);
      const monthEnd = new Date(year, m + 1, 1);
      
      const monthEvents = events.filter(e => 
        e.start_date >= monthStart && e.start_date < monthEnd
      ).length;
      
      const monthEventIds = events
        .filter(e => e.start_date >= monthStart && e.start_date < monthEnd)
        .map(e => e._id.toString());
      
      const monthAttendance = attendance.filter(a => 
        monthEventIds.includes(a.event_id.toString())
      ).length;

      monthlyTrend.push({
        month: monthNames[m],
        events: monthEvents,
        attendance: monthAttendance
      });
    }

    // Event-wise performance
    const eventPerformance = events.map(event => {
      const eventAttendance = attendance.filter(
        a => a.event_id.toString() === event._id.toString()
      ).length;
      const eventRegistrations = registrations.filter(
        r => r.event_id.toString() === event._id.toString()
      ).length;

      return {
        title: event.title,
        date: event.start_date.toLocaleDateString(),
        club: event.club_id?.name || "N/A",
        category: event.category || "N/A",
        registrations: eventRegistrations,
        attendance: eventAttendance,
        rate: eventRegistrations > 0 
          ? ((eventAttendance / eventRegistrations) * 100).toFixed(1) + "%" 
          : "N/A"
      };
    }).sort((a, b) => b.attendance - a.attendance);

    // ========== PDF GENERATION ==========
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // ==================== PAGE 1: OVERVIEW DASHBOARD ====================
    const page1 = pdfDoc.addPage([842, 595]); // A4 Landscape

    // Header
    page1.drawRectangle({
      x: 0, y: 545,
      width: 842, height: 50,
      color: rgb(0.31, 0.27, 0.9)
    });

    page1.drawText("INSTITUTE ACTIVITY REPORT", {
      x: 50, y: 565,
      size: 24,
      font: fontBold,
      color: rgb(1, 1, 1)
    });

    page1.drawText(`Period: ${periodLabel} | Generated: ${new Date().toLocaleDateString()}`, {
      x: 550, y: 565,
      size: 12,
      font,
      color: rgb(1, 1, 1)
    });

    // Stats Cards
    const statsData = [
      { label: "Total Clubs", value: clubs.length, color: COLORS.primary, subtitle: "Active clubs" },
      { label: "Total Events", value: events.length, color: COLORS.success, subtitle: `In ${periodLabel}` },
      { label: "Registrations", value: registrations.length, color: COLORS.warning, subtitle: "Total signups" },
      { label: "Attendance", value: attendance.length, color: COLORS.info, subtitle: "Participated" },
      { label: "Badges Earned", value: allBadges.length, color: COLORS.secondary, subtitle: "This year" }
    ];

    const statsImage = generateStatsCard(statsData, { width: 750, height: 160 });
    const statsImg = await pdfDoc.embedPng(statsImage);
    page1.drawImage(statsImg, { x: 45, y: 370, width: 750, height: 160 });

    // Department Pie Chart
    const deptPieChart = generatePieChart(deptBreakdown, {
      width: 380, height: 280,
      title: "Participation by Department"
    });
    const deptPieImg = await pdfDoc.embedPng(deptPieChart);
    page1.drawImage(deptPieImg, { x: 45, y: 80, width: 380, height: 280 });

    // Category Bar Chart
    const categoryEventsData = {};
    Object.entries(categoryBreakdown).forEach(([cat, data]) => {
      categoryEventsData[cat] = data.events;
    });

    const categoryChart = generateBarChart(categoryEventsData, {
      width: 380, height: 280,
      title: "Events by Category"
    });
    const categoryImg = await pdfDoc.embedPng(categoryChart);
    page1.drawImage(categoryImg, { x: 440, y: 80, width: 380, height: 280 });

    // Footer
    page1.drawText("Page 1 of 3", { x: 400, y: 20, size: 10, font, color: rgb(0.5, 0.5, 0.5) });

    // ==================== PAGE 2: CLUB-WISE ANALYSIS ====================
    const page2 = pdfDoc.addPage([842, 595]);

    // Header
    page2.drawRectangle({
      x: 0, y: 545,
      width: 842, height: 50,
      color: rgb(0.31, 0.27, 0.9)
    });

    page2.drawText("CLUB-WISE ANALYSIS", {
      x: 50, y: 565,
      size: 24,
      font: fontBold,
      color: rgb(1, 1, 1)
    });

    // Club Events Bar Chart
    const clubEventsData = {};
    clubWiseData.slice(0, 8).forEach(club => {
      clubEventsData[club.name] = club.events;
    });

    const clubEventsChart = generateBarChart(clubEventsData, {
      width: 380, height: 250,
      title: "Events Organized by Club"
    });
    const clubEventsImg = await pdfDoc.embedPng(clubEventsChart);
    page2.drawImage(clubEventsImg, { x: 45, y: 285, width: 380, height: 250 });

    // Club Attendance Bar Chart
    const clubAttendanceData = {};
    clubWiseData.slice(0, 8).forEach(club => {
      clubAttendanceData[club.name] = club.attendance;
    });

    const clubAttChart = generateBarChart(clubAttendanceData, {
      width: 380, height: 250,
      title: "Attendance by Club"
    });
    const clubAttImg = await pdfDoc.embedPng(clubAttChart);
    page2.drawImage(clubAttImg, { x: 440, y: 285, width: 380, height: 250 });

    // Club Performance Table
    const clubTableHeaders = ["Club Name", "Events", "Registrations", "Attendance", "Att. Rate"];
    const clubTableRows = clubWiseData.slice(0, 10).map(club => [
      club.name,
      club.events,
      club.registrations,
      club.attendance,
      club.avgAttendance + "%"
    ]);

    const clubTableImg = generateTableImage(clubTableHeaders, clubTableRows, {
      width: 750,
      title: "Club Performance Summary"
    });
    const clubTblImg = await pdfDoc.embedPng(clubTableImg);
    const tableHeight = Math.min(250, 60 + clubTableRows.length * 35);
    page2.drawImage(clubTblImg, { x: 45, y: 280 - tableHeight, width: 750, height: tableHeight });

    page2.drawText("Page 2 of 3", { x: 400, y: 20, size: 10, font, color: rgb(0.5, 0.5, 0.5) });

    // ==================== PAGE 3: TRENDS & TOP PERFORMERS ====================
    const page3 = pdfDoc.addPage([842, 595]);

    // Header
    page3.drawRectangle({
      x: 0, y: 545,
      width: 842, height: 50,
      color: rgb(0.31, 0.27, 0.9)
    });

    page3.drawText("TRENDS & TOP PERFORMERS", {
      x: 50, y: 565,
      size: 24,
      font: fontBold,
      color: rgb(1, 1, 1)
    });

    // Monthly Trend Line Chart
    const trendLineChart = generateLineChart({
      labels: monthlyTrend.map(m => m.month)
    }, {
      width: 500, height: 220,
      title: "Monthly Event & Attendance Trend",
      lines: [
        { label: "Events", values: monthlyTrend.map(m => m.events) },
        { label: "Attendance", values: monthlyTrend.map(m => m.attendance) }
      ]
    });
    const trendImg = await pdfDoc.embedPng(trendLineChart);
    page3.drawImage(trendImg, { x: 45, y: 310, width: 500, height: 220 });

    // Category Attendance Pie Chart
    const categoryAttData = {};
    Object.entries(categoryBreakdown).forEach(([cat, data]) => {
      if (data.attendance > 0) {
        categoryAttData[cat] = data.attendance;
      }
    });

    const catAttPie = generatePieChart(categoryAttData, {
      width: 280, height: 220,
      title: "Attendance by Category"
    });
    const catAttImg = await pdfDoc.embedPng(catAttPie);
    page3.drawImage(catAttImg, { x: 560, y: 310, width: 260, height: 220 });

    // Top Students Table
    const studentTableHeaders = ["Rank", "Student Name", "Department", "Points"];
    const studentTableRows = topStudents.map((s, i) => [
      `#${i + 1}`,
      s.name,
      s.department || "N/A",
      s.points
    ]);

    if (studentTableRows.length > 0) {
      const studentTableImg = generateTableImage(studentTableHeaders, studentTableRows, {
        width: 380,
        title: "Top 10 Students by Points"
      });
      const studentTblImg = await pdfDoc.embedPng(studentTableImg);
      page3.drawImage(studentTblImg, { x: 45, y: 30, width: 380, height: 270 });
    }

    // Top Events Table
    const eventTableHeaders = ["Event", "Club", "Registrations", "Attendance", "Rate"];
    const eventTableRows = eventPerformance.slice(0, 8).map(e => [
      e.title,
      e.club,
      e.registrations,
      e.attendance,
      e.rate
    ]);

    if (eventTableRows.length > 0) {
      const eventTableImg = generateTableImage(eventTableHeaders, eventTableRows, {
        width: 380,
        title: "Top Events by Attendance"
      });
      const eventTblImg = await pdfDoc.embedPng(eventTableImg);
      page3.drawImage(eventTblImg, { x: 440, y: 30, width: 380, height: 270 });
    }

    page3.drawText("Page 3 of 3", { x: 400, y: 20, size: 10, font, color: rgb(0.5, 0.5, 0.5) });

    // ========== FINALIZE & SEND PDF ==========
    const pdfBytes = await pdfDoc.save();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=institute-report-${type}-${year}.pdf`
    );
    return res.send(Buffer.from(pdfBytes));

  } catch (err) {
    console.error("Report generation error:", err);
    return res.status(500).json({ error: err.message });
  }
};

module.exports = { generateReportPDF };