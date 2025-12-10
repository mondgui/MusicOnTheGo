// backend/routes/messageRoutes.js
import express from "express";
import Message from "../models/Message.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * GET /api/messages/conversation/:userId
 * Get all messages between current user and another user
 */
router.get("/conversation/:userId", authMiddleware, async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const otherUserId = req.params.userId;

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, recipient: otherUserId },
        { sender: otherUserId, recipient: currentUserId },
      ],
    })
      .populate("sender", "name profileImage")
      .populate("recipient", "name profileImage")
      .sort({ createdAt: 1 });

    // Mark messages as read if they were sent to current user
    await Message.updateMany(
      {
        sender: otherUserId,
        recipient: currentUserId,
        read: false,
      },
      {
        read: true,
        readAt: new Date(),
      }
    );

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * POST /api/messages
 * Send a new message
 */
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { recipientId, text } = req.body;

    if (!recipientId || !text || !text.trim()) {
      return res.status(400).json({ message: "Recipient ID and message text are required." });
    }

    const message = await Message.create({
      sender: req.user.id,
      recipient: recipientId,
      text: text.trim(),
    });

    const populatedMessage = await Message.findById(message._id)
      .populate("sender", "name profileImage")
      .populate("recipient", "name profileImage");

    res.status(201).json(populatedMessage);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * GET /api/messages/unread-count
 * Get count of unread messages for current user
 */
router.get("/unread-count", authMiddleware, async (req, res) => {
  try {
    const count = await Message.countDocuments({
      recipient: req.user.id,
      read: false,
    });

    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;

