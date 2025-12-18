const MonthlyUserStats = require("../models/MonthlyUserStats");
const StudentAward = require("../models/StudentAwards");
const UserPoints = require("../models/UserPoints");

const getUserTotalPoints = async (req, res) => {
  try {
    const result = await UserPoints.aggregate([
      { $match: { user_id: req.userId } },
      {
        $group: {
          _id: "$user_id",
          totalPoints: { $sum: "$points" }
        }
      }
    ]);

    res.status(200).json({
      totalPoints: result.length > 0 ? result[0].totalPoints : 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get logged-in user's MONTHLY points + badges
 * Route: GET /api/gamification/points/me/monthly?month=&year=
 */
const getUserMonthlyStats = async (req, res) => {
  try {
    const { month, year } = req.query;

    if (month === undefined || year === undefined) {
      return res.status(400).json({
        message: "month and year are required"
      });
    }

    const stats = await MonthlyUserStats.findOne({
      user_id: req.userId,
      month: Number(month),
      year: Number(year)
    }).populate("badges");

    res.status(200).json({
      month: Number(month),
      year: Number(year),
      totalPoints: stats?.totalPoints || 0,
      badges: stats?.badges || []
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getMonthlyLeaderboard = async (req, res) => {
  try {
    const { month, year } = req.query;

    const leaderboard = await MonthlyUserStats.find({
      month: Number(month),
      year: Number(year)
    })
      .populate("user_id", "name email profileIMG")
      .sort({ totalPoints: -1 })
      .limit(20);

    res.status(200).json(leaderboard);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const getStudentOfMonth = async (req, res) => {
  try {
    const { month, year } = req.query;

    const winner = await StudentAward.findOne({
      type: "STUDENT_OF_MONTH",
      month,
      year
    }).populate("user_id", "name email profileIMG");

    res.status(200).json(winner);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getStudentOfYear = async (req, res) => {
  try {
    const { year } = req.query;

    const winner = await StudentAward.findOne({
      type: "STUDENT_OF_YEAR",
      year
    }).populate("user_id", "name email profileIMG");

    res.status(200).json(winner);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


module.exports = {
    getMonthlyLeaderboard,
    getStudentOfMonth,
    getStudentOfYear,
    getUserMonthlyStats,
    getUserTotalPoints
};
