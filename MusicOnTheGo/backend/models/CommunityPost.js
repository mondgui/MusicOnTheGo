// backend/models/CommunityPost.js
import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const communityPostSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    // Media URL (video or audio file)
    mediaUrl: {
      type: String,
      required: true,
    },
    // Media type: "video" | "audio"
    mediaType: {
      type: String,
      enum: ["video", "audio"],
      required: true,
    },
    // Thumbnail URL for video previews
    thumbnailUrl: {
      type: String,
      default: "",
    },
    // Instrument played in the post
    instrument: {
      type: String,
      required: true,
    },
    // Level: "Beginner" | "Intermediate" | "Advanced"
    level: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Beginner",
    },
    // Users who liked this post
    likes: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      default: [],
    },
    // Like count (cached for performance)
    likeCount: {
      type: Number,
      default: 0,
    },
    // Comments on this post
    comments: {
      type: [commentSchema],
      default: [],
    },
    // Comment count (cached for performance)
    commentCount: {
      type: Number,
      default: 0,
    },
    // Visibility: "public" | "students" | "teachers"
    visibility: {
      type: String,
      enum: ["public", "students", "teachers"],
      default: "public",
    },
  },
  { timestamps: true }
);

// Indexes for efficient querying
communityPostSchema.index({ author: 1, createdAt: -1 });
communityPostSchema.index({ instrument: 1, level: 1 });
communityPostSchema.index({ visibility: 1, createdAt: -1 });
communityPostSchema.index({ likeCount: -1, createdAt: -1 }); // For sorting by popularity

// Update likeCount when likes array changes
communityPostSchema.pre("save", function (next) {
  this.likeCount = this.likes.length;
  this.commentCount = this.comments.length;
  next();
});

const CommunityPost = mongoose.model("CommunityPost", communityPostSchema);

export default CommunityPost;

