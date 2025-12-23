// backend/routes/adminRoutes.js
import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";
import User from "../models/User.js";
import Booking from "../models/Booking.js";
import Message from "../models/Message.js";
import PracticeSession from "../models/PracticeSession.js";
import CommunityPost from "../models/CommunityPost.js";
import Resource from "../models/Resource.js";

const router = express.Router();

// All admin routes require authentication and admin role
// Note: You'll need to add "admin" to the User model role enum

/**
 * GET /api/admin/stats
 * Get dashboard statistics - User-focused metrics
 */
router.get(
  "/stats",
  authMiddleware,
  // roleMiddleware("admin"), // Uncomment when admin role is added
  async (req, res) => {
    try {
      const { timeRange = '30days' } = req.query; // Default to 30 days
      const now = new Date();
      
      // Calculate time range in days
      let days = 30;
      let aggregationUnit = 'day'; // 'day' or 'week' or 'month'
      
      switch (timeRange) {
        case '7days':
          days = 7;
          aggregationUnit = 'day';
          break;
        case '30days':
          days = 30;
          aggregationUnit = 'day';
          break;
        case '90days':
          days = 90;
          aggregationUnit = 'day';
          break;
        case '6months':
          days = 180;
          aggregationUnit = 'week';
          break;
        case '1year':
          days = 365;
          aggregationUnit = 'month';
          break;
        default:
          days = 30;
          aggregationUnit = 'day';
      }
      
      const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Basic counts
      const [
        totalUsers,
        students,
        teachers,
        totalBookings,
        pendingBookings,
        approvedBookings,
        totalMessages,
        totalPracticeSessions,
        totalResources,
        totalCommunityPosts,
      ] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ role: "student" }),
        User.countDocuments({ role: "teacher" }),
        Booking.countDocuments(),
        Booking.countDocuments({ status: "pending" }),
        Booking.countDocuments({ status: "approved" }),
        Message.countDocuments(),
        PracticeSession.countDocuments(),
        Resource.countDocuments(),
        CommunityPost.countDocuments(),
      ]);

      // User growth over time (based on timeRange) - Using aggregation for performance
      const userGrowthData = [];
      
      if (aggregationUnit === 'day') {
        // Daily aggregation for 7, 30, 90 days - Use MongoDB aggregation pipeline
        const startDate = new Date(now);
        startDate.setDate(startDate.getDate() - days);
        startDate.setHours(0, 0, 0, 0);
        
        const dailyGrowth = await User.aggregate([
          {
            $match: {
              createdAt: { $gte: startDate, $lte: now }
            }
          },
          {
            $group: {
              _id: {
                $dateToString: {
                  format: "%Y-%m-%d",
                  date: "$createdAt"
                }
              },
              count: { $sum: 1 }
            }
          },
          {
            $sort: { _id: 1 }
          }
        ]);
        
        // Create a map for quick lookup
        const growthMap = new Map();
        dailyGrowth.forEach(item => {
          growthMap.set(item._id, item.count);
        });
        
        // Fill in all days, including those with 0 users
        for (let i = days - 1; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() - i);
          date.setHours(0, 0, 0, 0);
          const dateStr = date.toISOString().split('T')[0];
          
          userGrowthData.push({
            date: dateStr,
            count: growthMap.get(dateStr) || 0
          });
        }
      } else if (aggregationUnit === 'week') {
        // Weekly aggregation for 6 months (26 weeks) - Use aggregation
        const weeks = 26;
        const startDate = new Date(now);
        startDate.setDate(startDate.getDate() - (weeks * 7));
        startDate.setHours(0, 0, 0, 0);
        
        // Get all users in the date range
        const allUsers = await User.find(
          { createdAt: { $gte: startDate, $lte: now } },
          { createdAt: 1 }
        ).lean();
        
        // Group by week manually (more reliable than $week)
        const growthMap = new Map();
        allUsers.forEach(user => {
          const userDate = new Date(user.createdAt);
          // Get Monday of the week
          const dayOfWeek = userDate.getDay();
          const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
          const weekStart = new Date(userDate);
          weekStart.setDate(weekStart.getDate() + diff);
          weekStart.setHours(0, 0, 0, 0);
          const weekKey = weekStart.toISOString().split('T')[0];
          
          growthMap.set(weekKey, (growthMap.get(weekKey) || 0) + 1);
        });
        
        // Fill in all weeks
        for (let i = weeks - 1; i >= 0; i--) {
          const weekStart = new Date(now);
          weekStart.setDate(weekStart.getDate() - (i * 7));
          weekStart.setHours(0, 0, 0, 0);
          
          // Set to start of week (Monday)
          const dayOfWeek = weekStart.getDay();
          const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
          weekStart.setDate(weekStart.getDate() + diff);
          
          const weekKey = weekStart.toISOString().split('T')[0];
          
          userGrowthData.push({
            date: weekKey,
            count: growthMap.get(weekKey) || 0
          });
        }
      } else if (aggregationUnit === 'month') {
        // Monthly aggregation for 1 year (12 months) - Use aggregation
        const months = 12;
        const startDate = new Date(now.getFullYear(), now.getMonth() - months, 1);
        startDate.setHours(0, 0, 0, 0);
        
        const monthlyGrowth = await User.aggregate([
          {
            $match: {
              createdAt: { $gte: startDate, $lte: now }
            }
          },
          {
            $group: {
              _id: {
                year: { $year: "$createdAt" },
                month: { $month: "$createdAt" }
              },
              count: { $sum: 1 }
            }
          },
          {
            $sort: { "_id.year": 1, "_id.month": 1 }
          }
        ]);
        
        // Create a map for quick lookup
        const growthMap = new Map();
        monthlyGrowth.forEach(item => {
          const monthStart = new Date(item._id.year, item._id.month - 1, 1);
          const monthKey = monthStart.toISOString().split('T')[0];
          growthMap.set(monthKey, item.count);
        });
        
        // Fill in all months
        for (let i = months - 1; i >= 0; i--) {
          const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
          monthStart.setHours(0, 0, 0, 0);
          const monthKey = monthStart.toISOString().split('T')[0];
          
          userGrowthData.push({
            date: monthKey,
            count: growthMap.get(monthKey) || 0
          });
        }
      }

      // Active vs Inactive users (logged in or had activity in last 7/30 days)
      // For now, we'll use bookings/messages as activity indicators
      const activeStudentIds7Days = await Booking.distinct("student", { createdAt: { $gte: sevenDaysAgo } });
      const activeTeacherIds7Days = await Booking.distinct("teacher", { createdAt: { $gte: sevenDaysAgo } });
      const activeMessageSenderIds7Days = await Message.distinct("sender", { createdAt: { $gte: sevenDaysAgo } });
      const newUsers7Days = await User.distinct("_id", { createdAt: { $gte: sevenDaysAgo } });
      
      const allActiveIds7Days = new Set([
        ...activeStudentIds7Days.map(id => id.toString()),
        ...activeTeacherIds7Days.map(id => id.toString()),
        ...activeMessageSenderIds7Days.map(id => id.toString()),
        ...newUsers7Days.map(id => id.toString())
      ]);
      
      const activeStudentIds30Days = await Booking.distinct("student", { createdAt: { $gte: thirtyDaysAgo } });
      const activeTeacherIds30Days = await Booking.distinct("teacher", { createdAt: { $gte: thirtyDaysAgo } });
      const activeMessageSenderIds30Days = await Message.distinct("sender", { createdAt: { $gte: thirtyDaysAgo } });
      const newUsers30Days = await User.distinct("_id", { createdAt: { $gte: thirtyDaysAgo } });
      
      const allActiveIds30Days = new Set([
        ...activeStudentIds30Days.map(id => id.toString()),
        ...activeTeacherIds30Days.map(id => id.toString()),
        ...activeMessageSenderIds30Days.map(id => id.toString()),
        ...newUsers30Days.map(id => id.toString())
      ]);

      // Top instruments by user count
      const allUsers = await User.find({}, "instruments location");
      const instrumentCounts = {};
      allUsers.forEach(user => {
        if (user.instruments && Array.isArray(user.instruments)) {
          user.instruments.forEach(instrument => {
            if (instrument) {
              instrumentCounts[instrument] = (instrumentCounts[instrument] || 0) + 1;
            }
          });
        }
      });
      const topInstruments = Object.entries(instrumentCounts)
        .map(([instrument, count]) => ({ instrument, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Top locations
      const locationCounts = {};
      allUsers.forEach(user => {
        if (user.location && user.location.trim()) {
          const location = user.location.trim();
          locationCounts[location] = (locationCounts[location] || 0) + 1;
        }
      });
      const topLocations = Object.entries(locationCounts)
        .map(([location, count]) => ({ location, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
      
      const usersWithLocation = Object.values(locationCounts).reduce((sum, count) => sum + count, 0);
      const usersWithoutLocation = totalUsers - usersWithLocation;

      // Teacher-Student ratios
      const teachersWithStudents = await Booking.distinct("teacher");
      const teacherStudentCounts = await Booking.aggregate([
        { $group: { _id: "$teacher", studentCount: { $addToSet: "$student" } } },
        { $project: { teacherId: "$_id", studentCount: { $size: "$studentCount" } } }
      ]);
      
      const teachersWithNoStudents = teachers - teachersWithStudents.length;
      const avgStudentsPerTeacher = teachers > 0 
        ? teacherStudentCounts.reduce((sum, t) => sum + t.studentCount, 0) / teachersWithStudents.length || 0
        : 0;

      // User onboarding funnel
      const usersWithProfile = await User.countDocuments({
        $or: [
          { instruments: { $exists: true, $ne: [], $not: { $size: 0 } } },
          { location: { $exists: true, $ne: "" } },
          { about: { $exists: true, $ne: "" } }
        ]
      });
      
      const studentsWithFirstBooking = await Booking.distinct("student").length;
      const teachersWithFirstBooking = await Booking.distinct("teacher").length;
      const usersWithFirstBooking = studentsWithFirstBooking + teachersWithFirstBooking;

      // Users who completed profile (has instruments or location)
      const completedProfile = await User.countDocuments({
        $or: [
          { instruments: { $exists: true, $ne: [], $not: { $size: 0 } } },
          { location: { $exists: true, $ne: "" } }
        ]
      });

      res.json({
        // Basic metrics
        totalUsers,
        students,
        teachers,
        totalBookings,
        pendingBookings,
        approvedBookings,
        totalMessages,
        totalPracticeSessions,
        totalResources,
        totalCommunityPosts,
        
        // User growth
        userGrowth: userGrowthData,
        
        // Active vs Inactive
        activeUsers7Days: allActiveIds7Days.size,
        activeUsers30Days: allActiveIds30Days.size,
        inactiveUsers7Days: totalUsers - allActiveIds7Days.size,
        inactiveUsers30Days: totalUsers - allActiveIds30Days.size,
        
        // Top instruments
        topInstruments,
        
        // Top locations
        topLocations,
        usersWithLocation,
        usersWithoutLocation,
        
        // Top locations
        topLocations,
        usersWithLocation,
        usersWithoutLocation,
        
        // Teacher-Student ratios
        teachersWithStudents: teachersWithStudents.length,
        teachersWithNoStudents,
        avgStudentsPerTeacher: Math.round(avgStudentsPerTeacher * 10) / 10,
        teacherStudentCounts: teacherStudentCounts.map(t => ({
          teacherId: t.teacherId,
          studentCount: t.studentCount
        })),
        
        // Onboarding funnel
        signedUp: totalUsers,
        completedProfile,
        usersWithFirstBooking,
        onboardingFunnel: {
          signedUp: totalUsers,
          completedProfile,
          firstBooking: usersWithFirstBooking
        }
      });
    } catch (err) {
      console.error("Error fetching admin stats:", err);
      res.status(500).json({ message: err.message });
    }
  }
);

/**
 * GET /api/admin/bookings
 * Get all bookings with pagination
 */
router.get(
  "/bookings",
  authMiddleware,
  // roleMiddleware("admin"),
  async (req, res) => {
    try {
      const { page = 1, limit = 50 } = req.query;
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skip = (pageNum - 1) * limitNum;

      const totalCount = await Booking.countDocuments();

      const bookings = await Booking.find()
        .populate("student", "name email profileImage")
        .populate("teacher", "name email profileImage")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum);

      res.json({
        bookings,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limitNum),
        },
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

/**
 * GET /api/admin/messages
 * Get all messages with pagination
 */
router.get(
  "/messages",
  authMiddleware,
  // roleMiddleware("admin"),
  async (req, res) => {
    try {
      const { page = 1, limit = 50 } = req.query;
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skip = (pageNum - 1) * limitNum;

      const totalCount = await Message.countDocuments();

      const messages = await Message.find()
        .populate("sender", "name email profileImage role")
        .populate("recipient", "name email profileImage role")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum);

      res.json({
        messages,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limitNum),
        },
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

/**
 * GET /api/admin/practice-sessions
 * Get all practice sessions with pagination
 */
router.get(
  "/practice-sessions",
  authMiddleware,
  // roleMiddleware("admin"),
  async (req, res) => {
    try {
      const { page = 1, limit = 50 } = req.query;
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skip = (pageNum - 1) * limitNum;

      const totalCount = await PracticeSession.countDocuments();

      const sessions = await PracticeSession.find()
        .populate("student", "name email profileImage")
        .sort({ date: -1 })
        .skip(skip)
        .limit(limitNum);

      res.json({
        sessions,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limitNum),
        },
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

/**
 * GET /api/admin/community-posts
 * Get all community posts with pagination
 */
router.get(
  "/community-posts",
  authMiddleware,
  // roleMiddleware("admin"),
  async (req, res) => {
    try {
      const { page = 1, limit = 50 } = req.query;
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skip = (pageNum - 1) * limitNum;

      const totalCount = await CommunityPost.countDocuments();

      const posts = await CommunityPost.find()
        .populate("author", "name email profileImage role")
        .populate("likes", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum);

      res.json({
        posts,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limitNum),
        },
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

/**
 * GET /api/admin/users
 * Get all users with pagination
 */
router.get(
  "/users",
  authMiddleware,
  // roleMiddleware("admin"),
  async (req, res) => {
    try {
      const { page = 1, limit = 50 } = req.query;
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skip = (pageNum - 1) * limitNum;

      const totalCount = await User.countDocuments();

      const users = await User.find()
        .select("-password")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum);

      res.json({
        users,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limitNum),
        },
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

/**
 * DELETE /api/admin/users/:id
 * Delete a user (admin only)
 */
router.delete(
  "/users/:id",
  authMiddleware,
  // roleMiddleware("admin"),
  async (req, res) => {
    try {
      const user = await User.findById(req.params.id);

      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }

      // Prevent deleting yourself
      if (user._id.toString() === req.user.id) {
        return res.status(400).json({ message: "You cannot delete your own account." });
      }

      await user.deleteOne();

      res.json({ message: "User deleted successfully." });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

/**
 * DELETE /api/admin/bookings/:id
 * Delete a booking (admin only)
 */
router.delete(
  "/bookings/:id",
  authMiddleware,
  // roleMiddleware("admin"),
  async (req, res) => {
    try {
      const booking = await Booking.findById(req.params.id);

      if (!booking) {
        return res.status(404).json({ message: "Booking not found." });
      }

      await booking.deleteOne();

      res.json({ message: "Booking deleted successfully." });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

/**
 * DELETE /api/admin/messages/:id
 * Delete a message (admin only)
 */
router.delete(
  "/messages/:id",
  authMiddleware,
  // roleMiddleware("admin"),
  async (req, res) => {
    try {
      const message = await Message.findById(req.params.id);

      if (!message) {
        return res.status(404).json({ message: "Message not found." });
      }

      await message.deleteOne();

      res.json({ message: "Message deleted successfully." });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

/**
 * DELETE /api/admin/community-posts/:id
 * Delete a community post (admin only)
 */
router.delete(
  "/community-posts/:id",
  authMiddleware,
  // roleMiddleware("admin"),
  async (req, res) => {
    try {
      const post = await CommunityPost.findById(req.params.id);

      if (!post) {
        return res.status(404).json({ message: "Post not found." });
      }

      await post.deleteOne();

      res.json({ message: "Post deleted successfully." });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

/**
 * DELETE /api/admin/practice-sessions/:id
 * Delete a practice session (admin only)
 */
router.delete(
  "/practice-sessions/:id",
  authMiddleware,
  // roleMiddleware("admin"),
  async (req, res) => {
    try {
      const session = await PracticeSession.findById(req.params.id);

      if (!session) {
        return res.status(404).json({ message: "Practice session not found." });
      }

      await session.deleteOne();

      res.json({ message: "Practice session deleted successfully." });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

/**
 * POST /api/admin/bulk-message
 * Send bulk messages to multiple users
 */
/**
 * GET /api/admin/search
 * Global search across all entities
 */
router.get(
  "/search",
  authMiddleware,
  // roleMiddleware("admin"),
  async (req, res) => {
    try {
      const { q, limit = 5 } = req.query;
      
      if (!q || q.trim().length === 0) {
        return res.json({
          users: [],
          bookings: [],
          messages: [],
          practiceSessions: [],
          communityPosts: [],
          resources: [],
        });
      }

      const searchTerm = q.trim();
      const searchRegex = new RegExp(searchTerm, 'i');
      const limitNum = parseInt(limit);

      // Search users
      const users = await User.find({
        $or: [
          { name: searchRegex },
          { email: searchRegex },
        ],
      })
        .select('name email role profileImage')
        .limit(limitNum);

      // Search bookings (by student/teacher name or status)
      const bookings = await Booking.find({
        $or: [
          { status: searchRegex },
        ],
      })
        .populate('student', 'name email')
        .populate('teacher', 'name email')
        .limit(limitNum)
        .sort({ createdAt: -1 });

      // Filter bookings by student/teacher name if they match
      const filteredBookings = bookings.filter(booking => {
        const studentName = booking.student?.name || '';
        const teacherName = booking.teacher?.name || '';
        return studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
               teacherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
               booking.status.toLowerCase().includes(searchTerm.toLowerCase());
      }).slice(0, limitNum);

      // Search messages (by text content or sender/recipient name)
      const messages = await Message.find({
        text: searchRegex,
      })
        .populate('sender', 'name email')
        .populate('recipient', 'name email')
        .limit(limitNum)
        .sort({ createdAt: -1 });

      // Search practice sessions (by student name or notes)
      const practiceSessions = await PracticeSession.find({
        $or: [
          { notes: searchRegex },
        ],
      })
        .populate('student', 'name email')
        .limit(limitNum)
        .sort({ date: -1 });

      // Filter practice sessions by student name
      const filteredSessions = practiceSessions.filter(session => {
        const studentName = session.student?.name || '';
        return studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
               (session.notes && session.notes.toLowerCase().includes(searchTerm.toLowerCase()));
      }).slice(0, limitNum);

      // Search community posts (by title or content)
      const communityPosts = await CommunityPost.find({
        $or: [
          { title: searchRegex },
          { content: searchRegex },
        ],
      })
        .populate('author', 'name email')
        .limit(limitNum)
        .sort({ createdAt: -1 });

      // Search resources (by title or description)
      const resources = await Resource.find({
        $or: [
          { title: searchRegex },
          { description: searchRegex },
        ],
      })
        .populate('uploadedBy', 'name email')
        .limit(limitNum)
        .sort({ createdAt: -1 });

      res.json({
        users,
        bookings: filteredBookings,
        messages,
        practiceSessions: filteredSessions,
        communityPosts,
        resources,
      });
    } catch (err) {
      console.error('Error in global search:', err);
      res.status(500).json({ message: err.message });
    }
  }
);

router.post(
  "/bulk-message",
  authMiddleware,
  // roleMiddleware("admin"),
  async (req, res) => {
    try {
      const { userIds, message, messageType } = req.body;

      if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json({ message: "User IDs array is required and must not be empty." });
      }

      if (!message || !message.trim()) {
        return res.status(400).json({ message: "Message text is required." });
      }

      // Get admin user ID (sender)
      const adminId = req.user.id;

      // Create messages for all recipients
      const messages = userIds.map((userId) => ({
        sender: adminId,
        recipient: userId,
        text: message.trim(),
        read: false,
      }));

      // Insert all messages
      const createdMessages = await Message.insertMany(messages);

      res.json({
        message: `Successfully sent ${createdMessages.length} message(s).`,
        count: createdMessages.length,
        messageIds: createdMessages.map((m) => m._id),
      });
    } catch (err) {
      console.error("Error sending bulk messages:", err);
      res.status(500).json({ message: err.message });
    }
  }
);

/**
 * GET /api/admin/users/filtered
 * Get filtered users based on criteria
 */
router.get(
  "/users/filtered",
  authMiddleware,
  // roleMiddleware("admin"),
  async (req, res) => {
    try {
      const {
        role,
        instrument,
        signupDateFrom,
        signupDateTo,
        activityLevel, // 'active', 'inactive', 'all'
        hasProfile,
        hasBooking,
      } = req.query;

      const query = {};

      // Filter by role
      if (role && role !== "all") {
        query.role = role;
      }

      // Filter by instrument
      if (instrument && instrument !== "all") {
        query.instruments = { $in: [instrument] };
      }

      // Filter by signup date range
      if (signupDateFrom || signupDateTo) {
        query.createdAt = {};
        if (signupDateFrom) {
          query.createdAt.$gte = new Date(signupDateFrom);
        }
        if (signupDateTo) {
          query.createdAt.$lte = new Date(signupDateTo);
        }
      }

      // Filter by profile completion
      if (hasProfile === "true") {
        query.$or = [
          { instruments: { $exists: true, $ne: [], $not: { $size: 0 } } },
          { location: { $exists: true, $ne: "" } },
        ];
      }

      // Get users matching the query
      let users = await User.find(query).select("-password").sort({ createdAt: -1 });

      // Filter by activity level (requires checking bookings/messages)
      if (activityLevel && activityLevel !== "all") {
        const now = new Date();
        const daysAgo = activityLevel === "active" ? 30 : null; // For inactive, we'll check users with no recent activity
        const cutoffDate = daysAgo ? new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000) : null;

        if (activityLevel === "active" && cutoffDate) {
          // Get users with recent bookings or messages
          const activeStudentIds = await Booking.distinct("student", { createdAt: { $gte: cutoffDate } });
          const activeTeacherIds = await Booking.distinct("teacher", { createdAt: { $gte: cutoffDate } });
          const activeMessageSenderIds = await Message.distinct("sender", { createdAt: { $gte: cutoffDate } });
          const newUserIds = await User.distinct("_id", { createdAt: { $gte: cutoffDate } });

          const activeIds = new Set([
            ...activeStudentIds.map((id) => id.toString()),
            ...activeTeacherIds.map((id) => id.toString()),
            ...activeMessageSenderIds.map((id) => id.toString()),
            ...newUserIds.map((id) => id.toString()),
          ]);

          users = users.filter((user) => activeIds.has(user._id.toString()));
        } else if (activityLevel === "inactive") {
          // Get users with no recent activity
          const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          const activeStudentIds = await Booking.distinct("student", { createdAt: { $gte: thirtyDaysAgo } });
          const activeTeacherIds = await Booking.distinct("teacher", { createdAt: { $gte: thirtyDaysAgo } });
          const activeMessageSenderIds = await Message.distinct("sender", { createdAt: { $gte: thirtyDaysAgo } });
          const newUserIds = await User.distinct("_id", { createdAt: { $gte: thirtyDaysAgo } });

          const activeIds = new Set([
            ...activeStudentIds.map((id) => id.toString()),
            ...activeTeacherIds.map((id) => id.toString()),
            ...activeMessageSenderIds.map((id) => id.toString()),
            ...newUserIds.map((id) => id.toString()),
          ]);

          users = users.filter((user) => !activeIds.has(user._id.toString()));
        }
      }

      // Filter by has booking
      if (hasBooking === "true") {
        const usersWithBookings = await Booking.distinct("student");
        const teachersWithBookings = await Booking.distinct("teacher");
        const allUsersWithBookings = [...usersWithBookings, ...teachersWithBookings].map((id) => id.toString());
        users = users.filter((user) => allUsersWithBookings.includes(user._id.toString()));
      }

      res.json({
        users,
        count: users.length,
      });
    } catch (err) {
      console.error("Error filtering users:", err);
      res.status(500).json({ message: err.message });
    }
  }
);

export default router;

