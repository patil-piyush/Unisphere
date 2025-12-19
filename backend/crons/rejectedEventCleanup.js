const cron = require("node-cron");
const Event = require("../models/event");
const EVENT_STATUS = require("../config/eventStatus");
const { REJECTED_EVENT_DELETE_AFTER_DAYS } = require("../config/eventCleanupConfig");
const { addDays } = require("../utils/dateUtils");

// Runs every day at 2 AM
const startRejectedEventCleanup = () => {
  cron.schedule("0 2 * * *", async () => {
    try {
      const now = new Date();

      const eventsToDelete = await Event.find({
        status: EVENT_STATUS.REJECTED,
        rejectionAt: {
          $lte: addDays(now, -REJECTED_EVENT_DELETE_AFTER_DAYS)
        }
      });

      if (eventsToDelete.length === 0) return;

      const ids = eventsToDelete.map(e => e._id);

      await Event.deleteMany({ _id: { $in: ids } });

      console.log(`[CRON] Deleted ${ids.length} rejected events`);

    } catch (error) {
      console.error("[CRON] Rejected event cleanup failed:", error.message);
    }
  });
};

module.exports = { startRejectedEventCleanup };
