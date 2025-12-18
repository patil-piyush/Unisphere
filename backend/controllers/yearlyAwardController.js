const MonthlyAward = require("../models/MonthlyAward");
const Badge = require("../models/Badge");
const User = require("../models/User");

/**
 * Declare Student of the Year
 * Based on max Student of the Month wins
 */
const declareStudentOfYear = async (year) => {
  // 1️⃣ Count monthly wins per user for the year
  const result = await MonthlyAward.aggregate([
    { $match: { year } },
    {
      $group: {
        _id: "$user_id",
        wins: { $sum: 1 }
      }
    },
    { $sort: { wins: -1 } },
    { $limit: 1 }
  ]);

  if (!result.length) return;

  const winnerUserId = result[0]._id;

  // 2️⃣ Fetch permanent badge
  const permanentBadge = await Badge.findOne({
    name: "Student of the Year",
    isPermanent: true
  });

  if (!permanentBadge) return;

  // 3️⃣ Assign permanent badge to user
  await User.findByIdAndUpdate(
    winnerUserId,
    { $addToSet: { permanentBadges: permanentBadge._id } }
  );
};

module.exports = {
  declareStudentOfYear
};
