const MonthlyPoints = require("../models/MonthlyPoints");
const Badge = require("../models/Badge");
const { getCurrentMonthYear } = require("../config/dateUtils");

/**
 * Get badges earned by logged-in user for a given month
 * Route: GET /api/gamification/badges/me?month=&year=
 */
const getMyMonthlyBadges = async (req, res) => {
  try {
    const userId = req.userId;
    let { month, year } = req.query;

    // ✅ fallback to current month/year
    if (month === undefined || year === undefined) {
      const current = getCurrentMonthYear();
      month = current.month;
      year = current.year;
    }

    // 1️⃣ Get user's monthly points
    const monthlyPoints = await MonthlyPoints.findOne({
      user_id: userId,
      month: Number(month),
      year: Number(year)
    });

    const points = monthlyPoints?.points || 0;

    // 2️⃣ Fetch monthly (non-permanent) badges
    const badges = await Badge.find({
      isPermanent: false,
      requiredPoints: { $lte: points }
    }).sort({ requiredPoints: 1 });

    res.status(200).json({
      month: Number(month),
      year: Number(year),
      points,
      badges
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getMyMonthlyBadges
};
