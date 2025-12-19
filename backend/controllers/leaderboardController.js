const MonthlyPoints = require("../models/MonthlyPoints");
const User = require("../models/user");
const { getCurrentMonthYear } = require("../config/dateUtils");
const Attendance = require("../models/attendance");

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

    const leaderboard = await MonthlyPoints.aggregate([
      {
        $match: {
          month: Number(month),
          year: Number(year)
        }
      },

      // Join user
      {
        $lookup: {
          from: "users",
          localField: "user_id",
          foreignField: "_id",
          as: "user"
        }
      },
      { $unwind: "$user" },

      // Join attendance (event count)
      {
        $lookup: {
          from: "attendances",
          let: { userId: "$user_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$user_id", "$$userId"]
                }
              }
            },
            {
              $match: {
                check_in_time: {
                  $gte: new Date(year, month, 1),
                  $lt: new Date(year, Number(month) + 1, 1)
                }
              }
            }
          ],
          as: "events"
        }
      },

      // Join badges (monthly only)
      {
        $lookup: {
          from: "badges",
          let: { points: "$points" },
          pipeline: [
            {
              $match: {
                isPermanent: false,
                $expr: { $lte: ["$requiredPoints", "$$points"] }
              }
            }
          ],
          as: "badges"
        }
      },

      // Shape final output
      {
        $project: {
          _id: 0,
          name: "$user.name",
          department: "$user.department",
          profileIMG: "$user.profileIMG",
          points: "$points",
          eventsCount: { $size: "$events" },
          badgesCount: { $size: "$badges" }
        }
      },

      { $sort: { points: -1 } },
      { $limit: 10 }
    ]);

    res.status(200).json({
      month: Number(month) + 1,
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
      month:month+1,
      year,
      points: record ? record.points : 0
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getMonthlyLeaderboardRank = async (req, res) => {
  try {
    let { month, year } = req.query;
    const userId = req.userId;
    // must be set by auth middleware

    if (!userId) {
      return res.status(401).json({ error: "Unauthenticated (no userId)" });
    }

    if (!month || !year) {
      const current = getCurrentMonthYear(); // must return month 0–11 if DB stores 0–11
      month = current.month;
      year = current.year;
    }

    const monthNum = Number(month);
    const yearNum = Number(year);

    console.log("RANK debug params:", { monthNum, yearNum, userId });

    const userEntry = await MonthlyPoints.findOne({
      user_id: userId,
      month: monthNum,
      year: yearNum,
    }).select("points");

    console.log("RANK userEntry:", userEntry);

    if (!userEntry) {
      return res.status(200).json({
        month: monthNum + 1,
        year: yearNum,
        rank: null,
        points: 0,
      });
    }

    const countAbove = await MonthlyPoints.countDocuments({
      user_id: { $ne: userId }, // optional: exclude self
      month: monthNum,
      year: yearNum,
      points: { $gt: userEntry.points },
    });

    const rank = countAbove + 1;

    return res.status(200).json({
      month: monthNum + 1,
      year: yearNum,
      rank,
      points: userEntry.points,
    });
  } catch (error) {
    console.error("RANK error:", error);
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getMonthlyLeaderboard,
  getUserMonthlyPoints,
  getMonthlyLeaderboardRank
};
