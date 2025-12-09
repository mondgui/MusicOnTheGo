// backend/routes/practiceRoutes.js
import express from "express";
import PracticeSession from "../models/PracticeSession.js";
import Goal from "../models/Goal.js";
import Recording from "../models/Recording.js";
import User from "../models/User.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

/**
 * Calculate badges based on student achievements
 */
function calculateBadges(streak, totalMinutes, totalSessions) {
  const badges = [];

  // Streak badges
  if (streak >= 30) {
    badges.push({ emoji: "🔥", text: `${streak}-Day Streak`, variant: "warning" });
  } else if (streak >= 14) {
    badges.push({ emoji: "🎯", text: `${streak}-Day Streak`, variant: "warning" });
  } else if (streak >= 7) {
    badges.push({ emoji: "🎯", text: `${streak}-Day Streak`, variant: "warning" });
  } else if (streak >= 5) {
    badges.push({ emoji: "🎯", text: `${streak}-Day Streak`, variant: "warning" });
  } else if (streak >= 3) {
    badges.push({ emoji: "🎯", text: `${streak}-Day Streak`, variant: "warning" });
  }

  // Total minutes milestones
  if (totalMinutes >= 10000) {
    badges.push({ emoji: "🏆", text: "10K Minutes", variant: "success" });
  } else if (totalMinutes >= 5000) {
    badges.push({ emoji: "⭐", text: "5K Minutes", variant: "success" });
  } else if (totalMinutes >= 2500) {
    badges.push({ emoji: "⭐", text: "2.5K Minutes", variant: "success" });
  } else if (totalMinutes >= 1000) {
    badges.push({ emoji: "⏰", text: "1K Minutes", variant: "success" });
  } else if (totalMinutes >= 500) {
    badges.push({ emoji: "⏰", text: "500 Minutes", variant: "success" });
  } else if (totalMinutes >= 100) {
    badges.push({ emoji: "⏰", text: "100 Minutes", variant: "success" });
  }

  // Encouraging titles based on activity patterns
  const encouragingTitles = [
    { condition: totalSessions >= 50 && streak >= 7, emoji: "🌟", text: "Dedicated Learner", variant: "default" },
    { condition: totalSessions >= 30 && streak >= 5, emoji: "🎵", text: "Consistent Performer", variant: "default" },
    { condition: totalSessions >= 20, emoji: "🎼", text: "Music Enthusiast", variant: "default" },
    { condition: totalSessions >= 10 && streak >= 3, emoji: "🎸", text: "Rising Star", variant: "default" },
    { condition: totalSessions >= 5, emoji: "🎹", text: "Getting Started", variant: "default" },
    { condition: totalMinutes >= 500 && streak >= 5, emoji: "🎵", text: "Dedicated Learner", variant: "default" },
    { condition: totalMinutes >= 200 && streak >= 3, emoji: "🎵", text: "Committed Student", variant: "default" },
    { condition: totalSessions >= 15, emoji: "🎵", text: "Regular Practitioner", variant: "default" },
  ];

  // Add the first matching encouraging title (most impressive first)
  for (const title of encouragingTitles) {
    if (title.condition) {
      // Check if we already have this badge
      const exists = badges.some(b => b.text === title.text);
      if (!exists) {
        badges.push(title);
        break; // Only add one encouraging title
      }
    }
  }

  return badges;
}

// ========== PRACTICE SESSIONS ==========

/**
 * STUDENT: Create a practice session
 */
router.post(
  "/sessions",
  authMiddleware,
  roleMiddleware("student"),
  async (req, res) => {
    try {
      const { minutes, focus, notes, startTime, endTime } = req.body;

      if (!minutes || !focus) {
        return res.status(400).json({ message: "Minutes and focus are required." });
      }

      const session = new PracticeSession({
        student: req.user.id,
        minutes: parseInt(minutes),
        focus,
        notes: notes || "",
        date: req.body.date ? new Date(req.body.date) : new Date(),
        startTime: startTime ? new Date(startTime) : new Date(),
        endTime: endTime ? new Date(endTime) : new Date(),
      });

      await session.save();
      res.status(201).json(session);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

/**
 * STUDENT: Get their own practice sessions
 */
router.get(
  "/sessions/me",
  authMiddleware,
  roleMiddleware("student"),
  async (req, res) => {
    try {
      const sessions = await PracticeSession.find({ student: req.user.id })
        .sort({ date: -1 });
      res.json(sessions);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

/**
 * TEACHER: Get practice sessions for a specific student
 */
router.get(
  "/sessions/student/:studentId",
  authMiddleware,
  roleMiddleware("teacher"),
  async (req, res) => {
    try {
      const sessions = await PracticeSession.find({ student: req.params.studentId })
        .sort({ date: -1 });
      res.json(sessions);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

/**
 * STUDENT: Get practice statistics
 */
router.get(
  "/stats/me",
  authMiddleware,
  roleMiddleware("student"),
  async (req, res) => {
    try {
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      const sessions = await PracticeSession.find({
        student: req.user.id,
        date: { $gte: startOfWeek },
      });

      const totalMinutes = sessions.reduce((sum, s) => sum + s.minutes, 0);
      
      // Calculate total weekly goal from all goals (sum of weeklyMinutes)
      const goals = await Goal.find({ student: req.user.id });
      const weeklyGoal = goals.reduce((sum, g) => sum + (g.weeklyMinutes || 0), 0);
      const weeklyProgress = weeklyGoal > 0 ? Math.min((totalMinutes / weeklyGoal) * 100, 100) : 0;

      // Calculate streak (consecutive days with practice)
      const allSessions = await PracticeSession.find({ student: req.user.id })
        .sort({ date: -1 });
      
      let streak = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      for (let i = 0; i < 30; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() - i);
        checkDate.setHours(0, 0, 0, 0);
        
        const nextDay = new Date(checkDate);
        nextDay.setDate(checkDate.getDate() + 1);
        
        const hasPractice = allSessions.some(s => {
          const sessionDate = new Date(s.date);
          sessionDate.setHours(0, 0, 0, 0);
          return sessionDate >= checkDate && sessionDate < nextDay;
        });
        
        if (hasPractice) {
          streak++;
        } else if (i > 0) {
          break; // Break if we hit a day without practice (but allow today to be empty)
        }
      }

      // Calculate total lifetime minutes
      const totalLifetimeMinutes = allSessions.reduce((sum, s) => sum + s.minutes, 0);

      // Calculate badges based on achievements
      const badges = calculateBadges(streak, totalLifetimeMinutes, allSessions.length);

      res.json({
        thisWeekMinutes: totalMinutes,
        weeklyGoal,
        weeklyProgress,
        streak,
        badges,
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

/**
 * TEACHER: Get practice statistics for a student
 */
router.get(
  "/stats/student/:studentId",
  authMiddleware,
  roleMiddleware("teacher"),
  async (req, res) => {
    try {
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      const sessions = await PracticeSession.find({
        student: req.params.studentId,
        date: { $gte: startOfWeek },
      });

      const totalMinutes = sessions.reduce((sum, s) => sum + s.minutes, 0);
      
      // Calculate total weekly goal from all goals (sum of weeklyMinutes)
      const goals = await Goal.find({ student: req.params.studentId });
      const weeklyGoal = goals.reduce((sum, g) => sum + (g.weeklyMinutes || 0), 0);
      const weeklyProgress = weeklyGoal > 0 ? Math.min((totalMinutes / weeklyGoal) * 100, 100) : 0;

      const allSessions = await PracticeSession.find({ student: req.params.studentId })
        .sort({ date: -1 });
      
      let streak = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      for (let i = 0; i < 30; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() - i);
        checkDate.setHours(0, 0, 0, 0);
        
        const nextDay = new Date(checkDate);
        nextDay.setDate(checkDate.getDate() + 1);
        
        const hasPractice = allSessions.some(s => {
          const sessionDate = new Date(s.date);
          sessionDate.setHours(0, 0, 0, 0);
          return sessionDate >= checkDate && sessionDate < nextDay;
        });
        
        if (hasPractice) {
          streak++;
        } else if (i > 0) {
          break;
        }
      }

      // Calculate total lifetime minutes
      const totalLifetimeMinutes = allSessions.reduce((sum, s) => sum + s.minutes, 0);

      // Calculate badges based on achievements
      const badges = calculateBadges(streak, totalLifetimeMinutes, allSessions.length);

      res.json({
        thisWeekMinutes: totalMinutes,
        weeklyGoal,
        weeklyProgress,
        streak,
        badges,
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// ========== GOALS ==========

/**
 * STUDENT: Create a goal
 */
router.post(
  "/goals",
  authMiddleware,
  roleMiddleware("student"),
  async (req, res) => {
    try {
      const { title, category, targetDate, progress, weeklyMinutes } = req.body;

      if (!title || !category || !targetDate) {
        return res.status(400).json({ message: "Title, category, and target date are required." });
      }

      const goal = new Goal({
        student: req.user.id,
        title,
        category,
        targetDate: new Date(targetDate),
        progress: progress || 0,
        weeklyMinutes: weeklyMinutes || 0,
      });

      await goal.save();
      res.status(201).json(goal);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

/**
 * STUDENT: Get their own goals
 */
router.get(
  "/goals/me",
  authMiddleware,
  roleMiddleware("student"),
  async (req, res) => {
    try {
      const goals = await Goal.find({ student: req.user.id })
        .sort({ createdAt: -1 });
      res.json(goals);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

/**
 * STUDENT: Update a goal
 */
router.put(
  "/goals/:id",
  authMiddleware,
  roleMiddleware("student"),
  async (req, res) => {
    try {
      const goal = await Goal.findById(req.params.id);

      if (!goal) {
        return res.status(404).json({ message: "Goal not found." });
      }

      if (goal.student.toString() !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized." });
      }

      if (req.body.progress !== undefined) goal.progress = req.body.progress;
      if (req.body.completed !== undefined) goal.completed = req.body.completed;
      if (req.body.title !== undefined) goal.title = req.body.title;
      if (req.body.category !== undefined) goal.category = req.body.category;
      if (req.body.targetDate !== undefined) goal.targetDate = new Date(req.body.targetDate);
      if (req.body.weeklyMinutes !== undefined) goal.weeklyMinutes = req.body.weeklyMinutes;

      await goal.save();
      res.json(goal);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

/**
 * STUDENT: Delete a goal
 */
router.delete(
  "/goals/:id",
  authMiddleware,
  roleMiddleware("student"),
  async (req, res) => {
    try {
      const goal = await Goal.findById(req.params.id);

      if (!goal) {
        return res.status(404).json({ message: "Goal not found." });
      }

      if (goal.student.toString() !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized." });
      }

      await Goal.findByIdAndDelete(req.params.id);
      res.json({ message: "Goal deleted successfully." });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

/**
 * TEACHER: Get goals for a specific student
 */
router.get(
  "/goals/student/:studentId",
  authMiddleware,
  roleMiddleware("teacher"),
  async (req, res) => {
    try {
      const goals = await Goal.find({ student: req.params.studentId })
        .sort({ createdAt: -1 });
      res.json(goals);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// ========== RECORDINGS ==========

/**
 * STUDENT: Create a recording
 */
router.post(
  "/recordings",
  authMiddleware,
  roleMiddleware("student"),
  async (req, res) => {
    try {
      const { title, fileUrl, duration, studentNotes, teacher } = req.body;

      if (!title) {
        return res.status(400).json({ message: "Title is required." });
      }

      const recording = new Recording({
        student: req.user.id,
        teacher: teacher || null,
        title,
        fileUrl: fileUrl || "",
        duration: duration || "",
        studentNotes: studentNotes || "",
      });

      await recording.save();
      res.status(201).json(recording);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

/**
 * STUDENT: Get their own recordings
 */
router.get(
  "/recordings/me",
  authMiddleware,
  roleMiddleware("student"),
  async (req, res) => {
    try {
      const recordings = await Recording.find({ student: req.user.id })
        .populate("teacher", "name email")
        .sort({ createdAt: -1 });
      res.json(recordings);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

/**
 * TEACHER: Get recordings for a specific student
 */
router.get(
  "/recordings/student/:studentId",
  authMiddleware,
  roleMiddleware("teacher"),
  async (req, res) => {
    try {
      const recordings = await Recording.find({ student: req.params.studentId })
        .populate("student", "name email")
        .sort({ createdAt: -1 });
      res.json(recordings);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

/**
 * TEACHER: Add feedback to a recording
 */
router.put(
  "/recordings/:id/feedback",
  authMiddleware,
  roleMiddleware("teacher"),
  async (req, res) => {
    try {
      const { teacherFeedback } = req.body;
      const recording = await Recording.findById(req.params.id);

      if (!recording) {
        return res.status(404).json({ message: "Recording not found." });
      }

      // Check if teacher is assigned to this recording or has bookings with the student
      const Booking = (await import("../models/Booking.js")).default;
      const hasBooking = await Booking.findOne({
        teacher: req.user.id,
        student: recording.student,
        status: "approved",
      });

      if (!hasBooking && recording.teacher?.toString() !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized. You must be the student's teacher." });
      }

      recording.teacherFeedback = teacherFeedback || "";
      recording.hasTeacherFeedback = true;
      recording.teacher = req.user.id;

      await recording.save();
      res.json(recording);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

export default router;

