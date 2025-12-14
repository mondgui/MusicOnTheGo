// backend/routes/challengeRoutes.js
import express from "express";
import Challenge from "../models/Challenge.js";
import ChallengeProgress from "../models/ChallengeProgress.js";
import PracticeSession from "../models/PracticeSession.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

/**
 * GET /api/challenges
 * STUDENT: Get all active challenges (public or assigned to student)
 * Query params: instrument, difficulty, status
 */
router.get("/", authMiddleware, async (req, res) => {
  try {
    const { instrument, difficulty, status = "active" } = req.query;
    const userId = req.user.id;

    const filter = {
      status: status,
      $or: [
        { visibility: "public" },
        { assignedStudents: userId },
      ],
    };

    if (instrument) filter.instrument = instrument;
    if (difficulty) filter.difficulty = difficulty;

    const challenges = await Challenge.find(filter)
      .populate("createdBy", "name profileImage")
      .sort({ createdAt: -1 });

    // For each challenge, check if student has joined and get progress
    const challengesWithProgress = await Promise.all(
      challenges.map(async (challenge) => {
        const progress = await ChallengeProgress.findOne({
          challenge: challenge._id,
          student: userId,
        });

        const challengeObj = challenge.toObject();
        challengeObj.isJoined = !!progress;
        challengeObj.progress = progress?.progress || 0;
        challengeObj.isCompleted = progress?.completed || false;
        challengeObj.participantCount = challenge.participants.length;

        return challengeObj;
      })
    );

    res.json(challengesWithProgress);
  } catch (err) {
    console.error("[Challenges] Error:", err);
    res.status(500).json({ message: err.message });
  }
});

/**
 * GET /api/challenges/me
 * STUDENT: Get challenges the student has joined
 * Query params: status (active, completed)
 */
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const { status } = req.query;
    const userId = req.user.id;

    const progressFilter = { student: userId };
    if (status === "completed") {
      progressFilter.completed = true;
    } else if (status === "active") {
      progressFilter.completed = false;
    }

    const progressEntries = await ChallengeProgress.find(progressFilter)
      .populate({
        path: "challenge",
        populate: { path: "createdBy", select: "name profileImage" },
      })
      .sort({ updatedAt: -1 });

    const challenges = progressEntries
      .filter((entry) => entry.challenge) // Filter out deleted challenges
      .map((entry) => {
        const challenge = entry.challenge.toObject();
        challenge.progress = entry.progress;
        challenge.isCompleted = entry.completed;
        challenge.completedAt = entry.completedAt;
        challenge.currentValue = entry.currentValue;
        return challenge;
      });

    res.json(challenges);
  } catch (err) {
    console.error("[Challenges] Error:", err);
    res.status(500).json({ message: err.message });
  }
});

/**
 * GET /api/challenges/teacher/me
 * TEACHER: Get all challenges created by the teacher
 * Query params: status (draft, active, completed, cancelled)
 */
router.get(
  "/teacher/me",
  authMiddleware,
  roleMiddleware("teacher"),
  async (req, res) => {
    try {
      const { status } = req.query;
      const filter = { createdBy: req.user.id };
      if (status) filter.status = status;

      const challenges = await Challenge.find(filter)
        .populate("participants", "name profileImage email")
        .sort({ createdAt: -1 });

      // For each challenge, get participant progress
      const challengesWithProgress = await Promise.all(
        challenges.map(async (challenge) => {
          const progressEntries = await ChallengeProgress.find({
            challenge: challenge._id,
          }).populate("student", "name profileImage email");

          const challengeObj = challenge.toObject();
          challengeObj.participantProgress = progressEntries.map((entry) => ({
            student: entry.student,
            progress: entry.progress,
            currentValue: entry.currentValue,
            completed: entry.completed,
            completedAt: entry.completedAt,
          }));

          return challengeObj;
        })
      );

      res.json(challengesWithProgress);
    } catch (err) {
      console.error("[Challenges] Error:", err);
      res.status(500).json({ message: err.message });
    }
  }
);

/**
 * GET /api/challenges/:id
 * Get a specific challenge by ID
 */
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id)
      .populate("createdBy", "name profileImage")
      .populate("participants", "name profileImage");

    if (!challenge) {
      return res.status(404).json({ message: "Challenge not found." });
    }

    // If student, get their progress
    if (req.user.role === "student") {
      const progress = await ChallengeProgress.findOne({
        challenge: challenge._id,
        student: req.user.id,
      });

      const challengeObj = challenge.toObject();
      challengeObj.isJoined = !!progress;
      challengeObj.progress = progress?.progress || 0;
      challengeObj.isCompleted = progress?.completed || false;
      challengeObj.currentValue = progress?.currentValue || 0;

      return res.json(challengeObj);
    }

    res.json(challenge);
  } catch (err) {
    console.error("[Challenges] Error:", err);
    res.status(500).json({ message: err.message });
  }
});

/**
 * POST /api/challenges
 * TEACHER: Create a new challenge
 */
router.post(
  "/",
  authMiddleware,
  roleMiddleware("teacher"),
  async (req, res) => {
    try {
      const {
        title,
        description,
        difficulty,
        deadline,
        reward,
        requirements,
        instrument,
        category,
        visibility,
        assignedStudents,
      } = req.body;

      if (!title || !description || !difficulty || !deadline || !requirements || !instrument) {
        return res.status(400).json({
          message: "Title, description, difficulty, deadline, requirements, and instrument are required.",
        });
      }

      const challenge = await Challenge.create({
        title,
        description,
        difficulty,
        deadline: new Date(deadline),
        reward: reward || "",
        requirements,
        createdBy: req.user.id,
        instrument,
        category: category || "",
        visibility: visibility || "public",
        assignedStudents: assignedStudents || [],
        status: "draft", // Start as draft, teacher can activate later
      });

      await challenge.populate("createdBy", "name profileImage");

      res.status(201).json(challenge);
    } catch (err) {
      console.error("[Challenges] Error:", err);
      res.status(500).json({ message: err.message });
    }
  }
);

/**
 * PUT /api/challenges/:id
 * TEACHER: Update a challenge (only if created by teacher)
 */
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("teacher"),
  async (req, res) => {
    try {
      const challenge = await Challenge.findById(req.params.id);

      if (!challenge) {
        return res.status(404).json({ message: "Challenge not found." });
      }

      if (challenge.createdBy.toString() !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized." });
      }

      // Update allowed fields
      const {
        title,
        description,
        difficulty,
        deadline,
        reward,
        requirements,
        instrument,
        category,
        visibility,
        assignedStudents,
        status,
      } = req.body;

      if (title) challenge.title = title;
      if (description) challenge.description = description;
      if (difficulty) challenge.difficulty = difficulty;
      if (deadline) challenge.deadline = new Date(deadline);
      if (reward !== undefined) challenge.reward = reward;
      if (requirements) challenge.requirements = requirements;
      if (instrument) challenge.instrument = instrument;
      if (category !== undefined) challenge.category = category;
      if (visibility) challenge.visibility = visibility;
      if (assignedStudents) challenge.assignedStudents = assignedStudents;
      if (status) challenge.status = status;

      await challenge.save();
      await challenge.populate("createdBy", "name profileImage");

      res.json(challenge);
    } catch (err) {
      console.error("[Challenges] Error:", err);
      res.status(500).json({ message: err.message });
    }
  }
);

/**
 * DELETE /api/challenges/:id
 * TEACHER: Delete a challenge (only if created by teacher)
 */
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("teacher"),
  async (req, res) => {
    try {
      const challenge = await Challenge.findById(req.params.id);

      if (!challenge) {
        return res.status(404).json({ message: "Challenge not found." });
      }

      if (challenge.createdBy.toString() !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized." });
      }

      // Delete all progress entries for this challenge
      await ChallengeProgress.deleteMany({ challenge: challenge._id });

      await Challenge.findByIdAndDelete(req.params.id);

      res.json({ message: "Challenge deleted successfully." });
    } catch (err) {
      console.error("[Challenges] Error:", err);
      res.status(500).json({ message: err.message });
    }
  }
);

/**
 * POST /api/challenges/:id/join
 * STUDENT: Join a challenge
 */
router.post("/:id/join", authMiddleware, async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);

    if (!challenge) {
      return res.status(404).json({ message: "Challenge not found." });
    }

    if (challenge.status !== "active") {
      return res.status(400).json({ message: "Challenge is not active." });
    }

    // Check if student is allowed to join
    if (challenge.visibility === "private") {
      if (!challenge.assignedStudents.includes(req.user.id)) {
        return res.status(403).json({ message: "You are not assigned to this challenge." });
      }
    }

    // Check if already joined
    const existingProgress = await ChallengeProgress.findOne({
      challenge: challenge._id,
      student: req.user.id,
    });

    if (existingProgress) {
      return res.status(400).json({ message: "You have already joined this challenge." });
    }

    // Add student to participants
    if (!challenge.participants.includes(req.user.id)) {
      challenge.participants.push(req.user.id);
      await challenge.save();
    }

    // Create progress entry
    const progress = await ChallengeProgress.create({
      challenge: challenge._id,
      student: req.user.id,
      progress: 0,
      currentValue: 0,
      completed: false,
    });

    await progress.populate({
      path: "challenge",
      populate: { path: "createdBy", select: "name profileImage" },
    });

    res.status(201).json(progress);
  } catch (err) {
    console.error("[Challenges] Error:", err);
    res.status(500).json({ message: err.message });
  }
});

/**
 * POST /api/challenges/:id/leave
 * STUDENT: Leave a challenge
 */
router.post("/:id/leave", authMiddleware, async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);

    if (!challenge) {
      return res.status(404).json({ message: "Challenge not found." });
    }

    // Remove progress entry
    await ChallengeProgress.findOneAndDelete({
      challenge: challenge._id,
      student: req.user.id,
    });

    // Remove from participants
    challenge.participants = challenge.participants.filter(
      (id) => id.toString() !== req.user.id
    );
    await challenge.save();

    res.json({ message: "Left challenge successfully." });
  } catch (err) {
    console.error("[Challenges] Error:", err);
    res.status(500).json({ message: err.message });
  }
});

/**
 * POST /api/challenges/update-progress
 * Internal endpoint to update challenge progress based on practice sessions
 * This can be called periodically or when practice sessions are created
 */
router.post("/update-progress", async (req, res) => {
  try {
    // Get all active challenges
    const activeChallenges = await Challenge.find({ status: "active" });

    for (const challenge of activeChallenges) {
      // Get all participants
      const progressEntries = await ChallengeProgress.find({
        challenge: challenge._id,
        completed: false,
      });

      for (const progressEntry of progressEntries) {
        let newValue = 0;

        // Calculate progress based on challenge type
        if (challenge.requirements.type === "practice_days") {
          // Count unique practice days within challenge period
          const startDate = challenge.createdAt;
          const endDate = challenge.deadline;

          const uniqueDays = await PracticeSession.distinct("date", {
            student: progressEntry.student,
            date: { $gte: startDate, $lte: endDate },
          });

          newValue = uniqueDays.length;
        } else if (challenge.requirements.type === "practice_sessions") {
          // Count practice sessions within challenge period
          const startDate = challenge.createdAt;
          const endDate = challenge.deadline;

          const sessionCount = await PracticeSession.countDocuments({
            student: progressEntry.student,
            date: { $gte: startDate, $lte: endDate },
          });

          newValue = sessionCount;
        }
        // For "recording" and "manual" types, progress is updated manually

        // Update progress
        const target = challenge.requirements.target;
        const newProgress = Math.min(Math.round((newValue / target) * 100), 100);
        const isCompleted = newProgress >= 100 && newValue >= target;

        progressEntry.currentValue = newValue;
        progressEntry.progress = newProgress;
        progressEntry.completed = isCompleted;
        if (isCompleted && !progressEntry.completedAt) {
          progressEntry.completedAt = new Date();
        }
        progressEntry.lastProgressUpdate = new Date();

        await progressEntry.save();
      }
    }

    res.json({ message: "Progress updated successfully." });
  } catch (err) {
    console.error("[Challenges] Error updating progress:", err);
    res.status(500).json({ message: err.message });
  }
});

export default router;

