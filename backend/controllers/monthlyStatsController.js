const UserPoints = require("../models/UserPoints");
const MonthlyUserStats = require("../models/MonthlyUserStats");
const Badge = require("../models/Badge");
const StudentAward = require("../models/studentAwards");



const calculateMonthlyStats = async (month, year) => {
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 1);

  const results = await UserPoints.aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lt: end }
      }
    },
    {
      $group: {
        _id: "$user_id",
        totalPoints: { $sum: "$points" }
      }
    }
  ]);

  for (const r of results) {
    await MonthlyUserStats.findOneAndUpdate(
      { user_id: r._id, month, year },
      { totalPoints: r.totalPoints },
      { upsert: true, new: true }
    );
  }
};

const assignMonthlyBadges = async (month, year) => {
  const badges = await Badge.find().sort({ requiredPoints: 1 });
  const stats = await MonthlyUserStats.find({ month, year });

  for (const stat of stats) {
    const earned = badges.filter(
      b => stat.totalPoints >= b.requiredPoints
    );

    stat.badges = earned.map(b => b._id);
    await stat.save();
  }
};


const declareStudentOfMonth = async (month, year) => {
  const top = await MonthlyUserStats.findOne({ month, year })
    .sort({ totalPoints: -1 });

  if (!top) return;

  top.isStudentOfMonth = true;
  await top.save();

  await StudentAward.create({
    user_id: top.user_id,
    type: "STUDENT_OF_MONTH",
    month,
    year,
    points: top.totalPoints
  });
};

const declareStudentOfYear = async (year) => {
  const yearly = await MonthlyUserStats.aggregate([
    { $match: { year } },
    {
      $group: {
        _id: "$user_id",
        totalPoints: { $sum: "$totalPoints" }
      }
    },
    { $sort: { totalPoints: -1 } },
    { $limit: 1 }
  ]);

  if (!yearly.length) return;

  await StudentAward.create({
    user_id: yearly[0]._id,
    type: "STUDENT_OF_YEAR",
    year,
    points: yearly[0].totalPoints
  });
};



module.exports = { calculateMonthlyStats, assignMonthlyBadges, declareStudentOfMonth, declareStudentOfYear };