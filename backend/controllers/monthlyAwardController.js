const MonthlyPoints = require("../models/MonthlyPoints");
const MonthlyAward = require("../models/MonthlyAward");

/**
 * Declare Student of the Month
 * Should be called ONCE per month
 */
const declareStudentOfMonth = async (month, year) => {
  // 1️⃣ Check if already declared
  const exists = await MonthlyAward.findOne({ month, year });
  if (exists) return;

  // 2️⃣ Find top scorer of the month
  const topStudent = await MonthlyPoints.findOne({ month, year })
    .sort({ points: -1 });

  if (!topStudent) return;

  // 3️⃣ Store award
  await MonthlyAward.create({
    user_id: topStudent.user_id,
    month,
    year
  });
};

module.exports = {
  declareStudentOfMonth
};
