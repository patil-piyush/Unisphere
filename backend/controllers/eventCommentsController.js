const Comment = require("../models/Comments");
const EventRegistration = require("../models/EventRegistration");

// Only registered users can comment

// Add comment
const addComment = async (req, res) => {
  try {
    const user_id = req.userId;
    const event_id = req.params.eventId;
    const { content, parent_comment_id } = req.body;

    // Basic validation
    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Comment content is required" });
    }

    // Check registration
    const isRegistered = await EventRegistration.exists({ event_id, user_id });
    if (!isRegistered) {
      return res.status(403).json({
        message: "You must be registered for this event to comment",
      });
    }

    // Validate parent comment (if reply)
    if (parent_comment_id) {
      const parentExists = await Comment.exists({
        _id: parent_comment_id,
        event_id, // ensures reply is for same event
      });

      if (!parentExists) {
        return res
          .status(400)
          .json({ message: "Parent comment not found for this event" });
      }
    }

    const comment = await Comment.create({
      event_id,
      user_id,
      content: content.trim(),
      parent_comment_id: parent_comment_id || null,
    });

    res.status(201).json({
      message: "Comment added",
      comment,
    });

  } catch (error) {
    console.error("Add comment error:", error);
    res.status(500).json({ error: "Failed to add comment" });
  }
};

// Get comments for an event (public)
const getEventComments = async (req, res) => {
  try {
    const comments = await Comment.find({ event_id: req.params.eventId })
      .populate("user_id", "name profileIMG")
      .sort({ createdAt: 1 });

    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete comment (only owner for now)
const deleteComment = async (req, res) => {
  try {
    const user_id = req.userId;
    const comment = await Comment.findById(req.params.commentId);

    if (!comment) return res.status(404).json({ message: "Comment not found" });

    if (comment.user_id.toString() !== user_id) {
      return res.status(403).json({ message: "You can delete only your comments" });
    }

    await Comment.deleteOne({ _id: comment._id });

    res.status(200).json({ message: "Comment deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Like / Unlike comment (toggle)
const toggleLikeComment = async (req, res) => {
  try {
    const user_id = req.userId;
    const comment = await Comment.findById(req.params.commentId);

    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const alreadyLiked = comment.likes.some(
      (id) => id.toString() === user_id.toString()
    );

    if (alreadyLiked) {
      comment.likes.pull(user_id);
      await comment.save();
      return res.status(200).json({ message: "Unliked", likeCount: comment.likes.length });
    } else {
      comment.likes.push(user_id);
      await comment.save();
      return res.status(200).json({ message: "Liked", likeCount: comment.likes.length });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


module.exports = {
  addComment,
  getEventComments,
  deleteComment,
  toggleLikeComment,
  
};