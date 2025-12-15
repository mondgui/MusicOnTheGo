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
    const { filter, instrument, sort = "recent", page, limit } = req.query;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Pagination parameters
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    const skip = (pageNum - 1) * limitNum;

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

    // Get total count for pagination (before filtering by role)
    const totalCount = await CommunityPost.countDocuments(queryFilter);

    // Fetch posts with pagination
    const posts = await CommunityPost.find(queryFilter)
      .populate("author", "name profileImage role")
      .populate("likes", "name")
      .populate("comments.author", "name profileImage")
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);

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

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limitNum);
    const hasMore = pageNum < totalPages;

    res.json({
      posts: postsWithLikeStatus,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalCount,
        totalPages,
        hasMore,
      },
    });
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
    const { page, limit } = req.query;
    
    // Pagination parameters
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    const skip = (pageNum - 1) * limitNum;

    // Get total count
    const totalCount = await CommunityPost.countDocuments({ author: req.user.id });

    // Fetch posts with pagination
    const posts = await CommunityPost.find({ author: req.user.id })
      .populate("author", "name profileImage role")
      .populate("likes", "name")
      .populate("comments.author", "name profileImage")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const postsWithLikeStatus = posts.map((post) => {
      const postObj = post.toObject();
      postObj.isLiked = post.likes.some(
        (likeId) => likeId.toString() === req.user.id
      );
      return postObj;
    });

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limitNum);
    const hasMore = pageNum < totalPages;

    res.json({
      posts: postsWithLikeStatus,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalCount,
        totalPages,
        hasMore,
      },
    });
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

    if (!["video", "audio", "image"].includes(mediaType)) {
      return res.status(400).json({
        message: "mediaType must be 'video', 'audio', or 'image'.",
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

