const express = require("express");
const router = express.Router();
const { userAuthMiddleware } = require("../middlewares/userAuthMiddleware");
const {
  addComment,
  getEventComments,
  deleteComment,
  toggleLikeComment,
} = require("../controllers/eventCommentsController");

// eventId in params for fetching
router.get("/:eventId", getEventComments);

// user actions
router.post("/:eventId/", userAuthMiddleware, addComment);
router.delete("/:commentId", userAuthMiddleware, deleteComment);
router.post("/:commentId/like", userAuthMiddleware, toggleLikeComment);

module.exports = router;
