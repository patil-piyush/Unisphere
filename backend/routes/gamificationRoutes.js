const express = require("express");
const router = express.Router();

const {userAuthMiddleware} = require("../middlewares/userAuthMiddleware");

// Controllers
const {
  scanAttendance,
  getLiveAttendance
} = require("../controllers/attendanceController");

const {
  getMyMonthlyBadges
} = require("../controllers/getMyMonthlyBadges");

/*
|--------------------------------------------------------------------------
| ATTENDANCE → POINTS
|--------------------------------------------------------------------------
| Points are awarded ONLY after successful attendance
*/

// User scans QR and marks attendance (points added here)
router.post(
  "/attendance/scan",
  userAuthMiddleware,
  scanAttendance
);

// Live attendance feed (club view)
router.get(
  "/attendance/live/:eventId",
  userAuthMiddleware,
  getLiveAttendance
);

/*
|--------------------------------------------------------------------------
| BADGES (MONTHLY)
|--------------------------------------------------------------------------
| Badges are derived from monthly points
*/

// Get logged-in user's monthly badges
router.get(
  "/badges/me",
  userAuthMiddleware,
  getMyMonthlyBadges
);

module.exports = router;
