const express = require("express");
const router = express.Router();

const { adminAuthMiddleware } = require("../middlewares/adminAuthMiddleware");

const {
  approveEvent,
  rejectEvent,
  getPendingEvents
} = require("../controllers/adminApproval");

// Approve event
router.put(
  "/events/:eventId/approve",
  adminAuthMiddleware,
  approveEvent
);

// Reject event (with reason)
router.put(
  "/events/:eventId/reject",
  adminAuthMiddleware,
  rejectEvent
);
// get all pending events
router.get(
  "/events/pending",
  adminAuthMiddleware,
  getPendingEvents
);

module.exports = router;
