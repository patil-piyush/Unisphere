const express = require("express");
const router = express.Router();

const {userAuthMiddleware} = require("../middlewares/userAuthMiddleware");

// Controllers
const {
  getMyMonthlyBadges
} = require("../controllers/getMyMonthlyBadges");

const {
  getMonthlyLeaderboard,
  getUserMonthlyPoints,
  getMonthlyLeaderboardRank
} = require('../controllers/leaderboardController')

// Get logged-in user's monthly badges
router.get(
  "/badges/me",
  userAuthMiddleware,
  getMyMonthlyBadges
);

router.get(
  "/leaderboard/monthly",
  getMonthlyLeaderboard
);


router.get(
  "/leaderboard/rank",
  userAuthMiddleware,
  getMonthlyLeaderboardRank
);

router.get(
  "/points/monthly",
  userAuthMiddleware,
  getUserMonthlyPoints
);

module.exports = router;
