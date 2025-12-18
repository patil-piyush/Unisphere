const cron = require("node-cron");
const { declareStudentOfMonth } = require("../controllers/monthlyAwardController");
const { declareStudentOfYear } = require("../controllers/yearlyAwardController");

// Monthly → runs on 1st day of every month at 00:05
cron.schedule("5 0 1 * *", async () => {
  const now = new Date();
  const month = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
  const year = month === 11 ? now.getFullYear() - 1 : now.getFullYear();

  await declareStudentOfMonth(month, year);
});

// Yearly → runs on Jan 1st at 00:10
cron.schedule("10 0 1 1 *", async () => {
  const year = new Date().getFullYear() - 1;
  await declareStudentOfYear(year);
});
