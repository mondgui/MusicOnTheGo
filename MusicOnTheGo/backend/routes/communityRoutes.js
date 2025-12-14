// backend/routes/communityRoutes.js
import express from "express";
import CommunityPost from "../models/CommunityPost.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * GET /api/community
 * Get community feed
 * Query params: filter (all, students, teachers), instrument, sort (recent, popular)
 */
router.get("/", authMiddleware, async (req, res) => {
  try {
    const { filter, instrument, sort = "recent" } = req.query;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Build filter based on visibility and user role
    const queryFilter = {};

    // Visibility filter
    if (filter === "students" || filter === "teachers") {
      queryFilter.$or = [
        { visibility: "public" },
        ...(filter === "students" ? [{ visibility: "students" }] : []),
        ...(filter === "teachers" ? [{ visibility: "teachers" }] : []),
      ];
    } else {
      // "all" - show posts visible to current user
      queryFilter.$or = [
        { visibility: "public" },
        ...(userRole === "student" ? [{ visibility: "students" }] : []),
        ...(userRole === "teacher" ? [{ visibility: "teachers" }] : []),
      ];
    }

    if (instrument) {
      queryFilter.instrument = instrument;
    }

    // Build sort
    let sortOption = { createdAt: -1 }; // Default: most recent
    if (sort === "popular") {
      sortOption = { likeCount: -1, createdAt: -1 }; // Most liked first
    } else if (sort === "comments") {
      sortOption = { commentCount: -1, createdAt: -1 }; // Most commented first
    }

    const posts = await CommunityPost.find(queryFilter)
      .populate("author", "name profileImage role")
      .populate("likes", "name")
      .populate("comments.author", "name profileImage")
      .sort(sortOption);

    // Filter by author role if needed (after population)
    let filteredPosts = posts;
    if (filter === "students") {
      filteredPosts = posts.filter((post) => post.author?.role === "student");
    } else if (filter === "teachers") {
      filteredPosts = posts.filter((post) => post.author?.role === "teacher");
    }

    // Check if current user liked each post
    const postsWithLikeStatus = filteredPosts.map((post) => {
      const postObj = post.toObject();
      postObj.isLiked = post.likes.some(
        (likeId) => likeId.toString() === userId
      );
      return postObj;
    });

    res.json(postsWithLikeStatus);
  } catch (err) {
    console.error("[Community] Error:", err);
    res.status(500).json({ message: err.message });
  }
});

/**
 * GET /api/community/me
 * Get current user's posts
 */
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const posts = await CommunityPost.find({ author: req.user.id })
      .populate("author", "name profileImage role")
      .populate("likes", "name")
      .populate("comments.author", "name profileImage")
      .sort({ createdAt: -1 });

    const postsWithLikeStatus = posts.map((post) => {
      const postObj = post.toObject();
      postObj.isLiked = post.likes.some(
        (likeId) => likeId.toString() === req.user.id
      );
      return postObj;
    });

    res.json(postsWithLikeStatus);
  } catch (err) {
    console.error("[Community] Error:", err);
    res.status(500).json({ message: err.message });
  }
});

/**
 * GET /api/community/:id
 * Get a specific post by ID
 */
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id)
      .populate("author", "name profileImage role")
      .populate("likes", "name")
      .populate("comments.author", "name profileImage");

    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }

    const postObj = post.toObject();
    postObj.isLiked = post.likes.some(
      (likeId) => likeId.toString() === req.user.id
    );

    res.json(postObj);
  } catch (err) {
    console.error("[Community] Error:", err);
    res.status(500).json({ message: err.message });
  }
});

/**
 * POST /api/community
 * Create a new community post
 */
router.post("/", authMiddleware, async (req, res) => {
  try {
    const {
      title,
      description,
      mediaUrl,
      mediaType,
      thumbnailUrl,
      instrument,
      level,
      visibility,
    } = req.body;

    console.log("[Community] Creating post with data:", {
      title,
      hasDescription: !!description,
      hasMediaUrl: !!mediaUrl,
      mediaType,
      hasThumbnailUrl: !!thumbnailUrl,
      instrument,
      level,
      visibility,
      author: req.user.id,
    });

    if (!title || !mediaUrl || !mediaType || !instrument) {
      return res.status(400).json({
        message: "Title, mediaUrl, mediaType, and instrument are required.",
      });
    }

    if (!["video", "audio"].includes(mediaType)) {
      return res.status(400).json({
        message: "mediaType must be 'video' or 'audio'.",
      });
    }

    const post = await CommunityPost.create({
      title,
      description: description || "",
      mediaUrl,
      mediaType,
      thumbnailUrl: thumbnailUrl || "",
      instrument,
      level: level || "Beginner",
      visibility: visibility || "public",
      author: req.user.id,
      likes: [],
      comments: [],
    });

    await post.populate("author", "name profileImage role");

    console.log("[Community] Post created successfully:", post._id);
    res.status(201).json(post);
  } catch (err) {
    console.error("[Community] Error creating post:", {
      message: err.message,
      stack: err.stack,
      name: err.name,
      body: req.body,
    });
    res.status(500).json({ 
      message: err.message || "Failed to create post",
      error: process.env.NODE_ENV === "development" ? err.stack : undefined
    });
  }
});

/**
 * PUT /api/community/:id
 * Update a post (only by author)
 */
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }

    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized." });
    }

    const { title, description, instrument, level, visibility } = req.body;

    if (title) post.title = title;
    if (description !== undefined) post.description = description;
    if (instrument) post.instrument = instrument;
    if (level) post.level = level;
    if (visibility) post.visibility = visibility;

    await post.save();
    await post.populate("author", "name profileImage role");
    await post.populate("likes", "name");
    await post.populate("comments.author", "name profileImage");

    const postObj = post.toObject();
    postObj.isLiked = post.likes.some(
      (likeId) => likeId.toString() === req.user.id
    );

    res.json(postObj);
  } catch (err) {
    console.error("[Community] Error:", err);
    res.status(500).json({ message: err.message });
  }
});

/**
 * DELETE /api/community/:id
 * Delete a post (only by author)
 */
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }

    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized." });
    }

    await CommunityPost.findByIdAndDelete(req.params.id);

    res.json({ message: "Post deleted successfully." });
  } catch (err) {
    console.error("[Community] Error:", err);
    res.status(500).json({ message: err.message });
  }
});

/**
 * POST /api/community/:id/like
 * Like or unlike a post
 */
router.post("/:id/like", authMiddleware, async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }

    const userId = req.user.id;
    const isLiked = post.likes.some((likeId) => likeId.toString() === userId);

    if (isLiked) {
      // Unlike
      post.likes = post.likes.filter(
        (likeId) => likeId.toString() !== userId
      );
    } else {
      // Like
      post.likes.push(userId);
    }

    await post.save();
    await post.populate("author", "name profileImage role");
    await post.populate("likes", "name");
    await post.populate("comments.author", "name profileImage");

    const postObj = post.toObject();
    postObj.isLiked = !isLiked;

    res.json(postObj);
  } catch (err) {
    console.error("[Community] Error:", err);
    res.status(500).json({ message: err.message });
  }
});

/**
 * POST /api/community/:id/comment
 * Add a comment to a post
 */
router.post("/:id/comment", authMiddleware, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim() === "") {
      return res.status(400).json({ message: "Comment text is required." });
    }

    const post = await CommunityPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }

    post.comments.push({
      author: req.user.id,
      text: text.trim(),
    });

    await post.save();
    await post.populate("author", "name profileImage role");
    await post.populate("likes", "name");
    await post.populate("comments.author", "name profileImage");

    const postObj = post.toObject();
    postObj.isLiked = post.likes.some(
      (likeId) => likeId.toString() === req.user.id
    );

    res.json(postObj);
  } catch (err) {
    console.error("[Community] Error:", err);
    res.status(500).json({ message: err.message });
  }
});

/**
 * DELETE /api/community/:id/comment/:commentId
 * Delete a comment (only by comment author or post author)
 */
router.delete("/:id/comment/:commentId", authMiddleware, async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }

    const comment = post.comments.id(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found." });
    }

    // Check if user is comment author or post author
    const isCommentAuthor =
      comment.author.toString() === req.user.id;
    const isPostAuthor = post.author.toString() === req.user.id;

    if (!isCommentAuthor && !isPostAuthor) {
      return res.status(403).json({ message: "Unauthorized." });
    }

    post.comments.pull(req.params.commentId);
    await post.save();
    await post.populate("author", "name profileImage role");
    await post.populate("likes", "name");
    await post.populate("comments.author", "name profileImage");

    const postObj = post.toObject();
    postObj.isLiked = post.likes.some(
      (likeId) => likeId.toString() === req.user.id
    );

    res.json(postObj);
  } catch (err) {
    console.error("[Community] Error:", err);
    res.status(500).json({ message: err.message });
  }
});

export default router;

