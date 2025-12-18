const MonthlyPoints = require("../models/MonthlyPoints");
const { getCurrentMonthYear } = require("../config/dateUtils");

/**
 * 1️⃣ Monthly Leaderboard
 * Top users based on points for a given month
 * Query params: month, year (optional)
 */
const getMonthlyLeaderboard = async (req, res) => {
  try {
    let { month, year } = req.query;

    // fallback to current month/year
    if (!month || !year) {
      const current = getCurrentMonthYear();
      month = current.month;
      year = current.year;
    }

    const leaderboard = await MonthlyPoints.find({
      month: Number(month),
      year: Number(year)
    })
      .populate("user_id", "name email")
      .sort({ points: -1 })
      .limit(10);

    res.status(200).json({
      month,
      year,
      leaderboard
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * 2️⃣ Logged-in User → Monthly Points
 * Query params: month, year (optional)
 */
const getUserMonthlyPoints = async (req, res) => {
  try {
    let { month, year } = req.query;
    const userId = req.userId;

    // fallback to current month/year
    if (!month || !year) {
      const current = getCurrentMonthYear();
      month = current.month;
      year = current.year;
    }

    const record = await MonthlyPoints.findOne({
      user_id: userId,
      month: Number(month),
      year: Number(year)
    });

    res.status(200).json({
      month,
      year,
      points: record ? record.points : 0
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getMonthlyLeaderboard,
  getUserMonthlyPoints
};
