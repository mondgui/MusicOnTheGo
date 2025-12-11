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
 * GET /api/messages/conversations
 * Get all unique conversations for the current user
 */
router.get("/conversations", authMiddleware, async (req, res) => {
  try {
    const currentUserId = req.user.id;

    // Get all messages where current user is sender or recipient
    const messages = await Message.find({
      $or: [
        { sender: currentUserId },
        { recipient: currentUserId },
      ],
    })
      .populate("sender", "name profileImage email")
      .populate("recipient", "name profileImage email")
      .sort({ createdAt: -1 });

    // Create a map of unique contacts with their last message
    const conversationsMap = new Map();

    messages.forEach((msg) => {
      const otherUser = String(msg.sender._id) === String(currentUserId) 
        ? msg.recipient 
        : msg.sender;
      
      const otherUserId = String(otherUser._id);
      const isOwnMessage = String(msg.sender._id) === String(currentUserId);
      
      if (!conversationsMap.has(otherUserId)) {
        // Only count unread if message was sent TO current user (not by current user)
        const isUnread = !isOwnMessage && msg.read === false;
        conversationsMap.set(otherUserId, {
          userId: otherUserId,
          name: otherUser.name || "Unknown",
          profileImage: otherUser.profileImage || "",
          email: otherUser.email || "",
          lastMessage: msg.text,
          lastMessageTime: msg.createdAt,
          unreadCount: isUnread ? 1 : 0,
        });
      } else {
        // Update unread count if this is an unread message sent TO current user
        const conversation = conversationsMap.get(otherUserId);
        if (!isOwnMessage && msg.read === false) {
          conversation.unreadCount += 1;
        }
        // Update last message if this is more recent
        if (new Date(msg.createdAt) > new Date(conversation.lastMessageTime)) {
          conversation.lastMessage = msg.text;
          conversation.lastMessageTime = msg.createdAt;
        }
      }
    });

    // Convert map to array and sort by last message time
    const conversations = Array.from(conversationsMap.values())
      .sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));

    res.json(conversations);
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

