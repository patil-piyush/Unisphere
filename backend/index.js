require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const connection = require("./config/db");

const clubRoutes = require("./routes/clubRoutes");
const clubMemberRoutes = require("./routes/clubMemberRoutes");
const userRoutes = require("./routes/userRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");

//events related routes can be added similarly
const eventRoutes = require("./routes/eventsRoutes");
const eventRegistrationRoutes = require("./routes/eventRegistrationRoute");
const eventCommentRoutes = require("./routes/eventCommentRoute");

// admin related
const adminRoutes = require("./routes/adminRoutes");
const adminEventsRoutes = require("./routes/adminEventsRoutes");

// Leaderboard related routes
const gamificationRoutes = require("./routes/gamificationRoutes");

// crons
const {startRejectedEventCleanup} = require("./crons/rejectedEventCleanup");
require("./crons/gamificationCron");

//swaggere related
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger/swagger.json");

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: "http://localhost:3000", // your frontend
  credentials: true
}));

// Routes
app.use("/api/clubs", clubRoutes);
app.use("/api/members", clubMemberRoutes);
app.use("/api/users", userRoutes);

//Routes Event Related
app.use("/api/events", eventRoutes);
app.use("/api/event-registrations", eventRegistrationRoutes);
app.use("/api/event-comments", eventCommentRoutes);

// admin related routes
app.use("/api/admin", adminRoutes);
app.use("/api/admin", adminEventsRoutes);

//Attendance Routes 
app.use("/api", attendanceRoutes);

// Leaderboard Routes
app.use("/api/gamification", gamificationRoutes);

//swagger setup
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Connect DB and start server
connection().then(() => {
  // Start cron jobs
  startRejectedEventCleanup();
  
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});