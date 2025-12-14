// backend/routes/resourceRoutes.js
import express from "express";
import Resource from "../models/Resource.js";
import ResourceAssignment from "../models/ResourceAssignment.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

/**
 * GET /api/resources
 * Get all resources (for students) or filtered resources
 * Query params: instrument, level, category
 */
router.get("/", async (req, res) => {
  try {
    console.log("[Resources] GET /api/resources - Query params:", req.query);
    
    const { instrument, level, category } = req.query;
    
    const filter = {};
    if (instrument) filter.instrument = instrument;
    if (level) filter.level = level;
    if (category) filter.category = category;
    
    console.log("[Resources] Filter:", filter);
    
    const resources = await Resource.find(filter)
      .populate("uploadedBy", "name profileImage")
      .sort({ createdAt: -1 }); // Newest first
    
    console.log("[Resources] Found", resources.length, "resources");
    res.json(resources);
  } catch (err) {
    console.error("[Resources] Error:", err);
    res.status(500).json({ message: err.message });
  }
});

/**
 * GET /api/resources/me
 * TEACHER: Get all resources uploaded by the current teacher
 */
router.get(
  "/me",
  authMiddleware,
  roleMiddleware("teacher"),
  async (req, res) => {
    try {
      const resources = await Resource.find({ uploadedBy: req.user.id })
        .populate("uploadedBy", "name profileImage")
        .sort({ createdAt: -1 });
      
      res.json(resources);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

/**
 * POST /api/resources
 * TEACHER: Create a new resource
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
        fileUrl,
        externalUrl,
        fileType,
        fileSize,
        instrument,
        level,
        category,
      } = req.body;

      if (!title || !fileType || !instrument || !level) {
        return res.status(400).json({
          message: "Title, fileType, instrument, and level are required.",
        });
      }

      // Must have either fileUrl or externalUrl
      if (!fileUrl && !externalUrl) {
        return res.status(400).json({
          message: "Either fileUrl or externalUrl must be provided.",
        });
      }

      const resource = new Resource({
        title,
        description: description || "",
        fileUrl: fileUrl || "",
        externalUrl: externalUrl || "",
        fileType,
        fileSize: fileSize || 0,
        instrument,
        level,
        category: category || "",
        uploadedBy: req.user.id,
      });

      await resource.save();
      
      // Populate uploadedBy before sending response
      await resource.populate("uploadedBy", "name profileImage");
      
      res.status(201).json(resource);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

/**
 * PUT /api/resources/:id
 * TEACHER: Update a resource (only the owner can update)
 */
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("teacher"),
  async (req, res) => {
    try {
      const resource = await Resource.findById(req.params.id);

      if (!resource) {
        return res.status(404).json({ message: "Resource not found." });
      }

      // Only the owner can update
      if (resource.uploadedBy.toString() !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized." });
      }

      const {
        title,
        description,
        fileUrl,
        externalUrl,
        fileType,
        fileSize,
        instrument,
        level,
        category,
      } = req.body;

      if (title) resource.title = title;
      if (description !== undefined) resource.description = description;
      if (fileUrl !== undefined) resource.fileUrl = fileUrl;
      if (externalUrl !== undefined) resource.externalUrl = externalUrl;
      if (fileType) resource.fileType = fileType;
      if (fileSize !== undefined) resource.fileSize = fileSize;
      if (instrument) resource.instrument = instrument;
      if (level) resource.level = level;
      if (category !== undefined) resource.category = category;

      await resource.save();
      
      await resource.populate("uploadedBy", "name profileImage");
      
      res.json(resource);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

/**
 * DELETE /api/resources/:id
 * TEACHER: Delete a resource (only the owner can delete)
 */
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("teacher"),
  async (req, res) => {
    try {
      const resource = await Resource.findById(req.params.id);

      if (!resource) {
        return res.status(404).json({ message: "Resource not found." });
      }

      // Only the owner can delete
      if (resource.uploadedBy.toString() !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized." });
      }

      await resource.deleteOne();

      res.json({ message: "Resource deleted successfully." });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

/**
 * POST /api/resources/:id/assign
 * TEACHER: Assign a resource to students with optional notes
 */
router.post(
  "/:id/assign",
  authMiddleware,
  roleMiddleware("teacher"),
  async (req, res) => {
    try {
      const { studentIds, notes } = req.body; // studentIds: Array of student IDs, notes: Object mapping studentId to note

      if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
        return res.status(400).json({
          message: "studentIds array is required and must not be empty.",
        });
      }

      const resource = await Resource.findById(req.params.id);

      if (!resource) {
        return res.status(404).json({ message: "Resource not found." });
      }

      // Only the owner can assign
      if (resource.uploadedBy.toString() !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized." });
      }

      // Add students to assignedTo (avoid duplicates)
      const existingIds = resource.assignedTo.map((id) => id.toString());
      const newIds = studentIds.filter((id) => !existingIds.includes(id.toString()));
      
      if (newIds.length > 0) {
        resource.assignedTo.push(...newIds);
        await resource.save();
      }

      // Create or update ResourceAssignment records with notes
      const assignmentPromises = studentIds.map(async (studentId) => {
        const note = notes && notes[studentId] ? notes[studentId] : "";
        
        // Use findOneAndUpdate with upsert to create or update
        return ResourceAssignment.findOneAndUpdate(
          { resource: req.params.id, student: studentId },
          {
            resource: req.params.id,
            student: studentId,
            teacher: req.user.id,
            note: note,
          },
          { upsert: true, new: true }
        );
      });

      await Promise.all(assignmentPromises);

      await resource.populate("uploadedBy", "name profileImage");
      await resource.populate("assignedTo", "name email");

      res.json(resource);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

/**
 * DELETE /api/resources/:id/assign/:studentId
 * TEACHER: Unassign a resource from a student
 */
router.delete(
  "/:id/assign/:studentId",
  authMiddleware,
  roleMiddleware("teacher"),
  async (req, res) => {
    try {
      const resource = await Resource.findById(req.params.id);

      if (!resource) {
        return res.status(404).json({ message: "Resource not found." });
      }

      // Only the owner can unassign
      if (resource.uploadedBy.toString() !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized." });
      }

      resource.assignedTo = resource.assignedTo.filter(
        (id) => id.toString() !== req.params.studentId
      );

      await resource.save();

      // Also delete the ResourceAssignment record
      await ResourceAssignment.findOneAndDelete({
        resource: req.params.id,
        student: req.params.studentId,
      });

      await resource.populate("uploadedBy", "name profileImage");
      await resource.populate("assignedTo", "name email");

      res.json(resource);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

/**
 * GET /api/resources/assigned
 * STUDENT: Get all resources assigned to the current student with notes
 */
router.get(
  "/assigned",
  authMiddleware,
  roleMiddleware("student"),
  async (req, res) => {
    try {
      const resources = await Resource.find({
        assignedTo: req.user.id,
      })
        .populate("uploadedBy", "name profileImage")
        .sort({ createdAt: -1 });

      // Get assignment notes for each resource
      const resourcesWithNotes = await Promise.all(
        resources.map(async (resource) => {
          const assignment = await ResourceAssignment.findOne({
            resource: resource._id,
            student: req.user.id,
          }).populate("teacher", "name profileImage");

          const resourceObj = resource.toObject();
          resourceObj.assignmentNote = assignment ? assignment.note : "";
          resourceObj.assignmentTeacher = assignment ? assignment.teacher : null;
          resourceObj.assignmentUpdatedAt = assignment ? assignment.updatedAt : null;

          return resourceObj;
        })
      );

      res.json(resourcesWithNotes);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

/**
 * GET /api/resources/assignments
 * TEACHER: Get all resources that have been assigned to students with notes
 */
router.get(
  "/assignments",
  authMiddleware,
  roleMiddleware("teacher"),
  async (req, res) => {
    try {
      const resources = await Resource.find({
        uploadedBy: req.user.id,
        assignedTo: { $exists: true, $ne: [] }, // Has at least one assignment
      })
        .populate("uploadedBy", "name profileImage")
        .populate("assignedTo", "name email profileImage")
        .sort({ createdAt: -1 });

      // Get assignment notes for each resource-student pair
      const resourcesWithNotes = await Promise.all(
        resources.map(async (resource) => {
          const assignments = await ResourceAssignment.find({
            resource: resource._id,
            teacher: req.user.id,
          }).populate("student", "name email profileImage");

          const resourceObj = resource.toObject();
          resourceObj.assignments = assignments.map((assignment) => ({
            student: assignment.student,
            note: assignment.note,
            updatedAt: assignment.updatedAt,
            createdAt: assignment.createdAt,
          }));

          return resourceObj;
        })
      );

      res.json(resourcesWithNotes);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

/**
 * PUT /api/resources/:id/assign/:studentId/note
 * TEACHER: Update the note for a specific assignment
 */
router.put(
  "/:id/assign/:studentId/note",
  authMiddleware,
  roleMiddleware("teacher"),
  async (req, res) => {
    try {
      const { note } = req.body;

      const resource = await Resource.findById(req.params.id);

      if (!resource) {
        return res.status(404).json({ message: "Resource not found." });
      }

      // Only the owner can update notes
      if (resource.uploadedBy.toString() !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized." });
      }

      const assignment = await ResourceAssignment.findOneAndUpdate(
        { resource: req.params.id, student: req.params.studentId, teacher: req.user.id },
        { note: note || "" },
        { new: true, upsert: true }
      ).populate("student", "name email profileImage");

      res.json(assignment);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

/**
 * DELETE /api/resources/:id/assign/:studentId/note
 * TEACHER: Delete the note for a specific assignment (but keep the assignment)
 */
router.delete(
  "/:id/assign/:studentId/note",
  authMiddleware,
  roleMiddleware("teacher"),
  async (req, res) => {
    try {
      const resource = await Resource.findById(req.params.id);

      if (!resource) {
        return res.status(404).json({ message: "Resource not found." });
      }

      // Only the owner can delete notes
      if (resource.uploadedBy.toString() !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized." });
      }

      const assignment = await ResourceAssignment.findOneAndUpdate(
        { resource: req.params.id, student: req.params.studentId, teacher: req.user.id },
        { note: "" },
        { new: true }
      );

      if (!assignment) {
        return res.status(404).json({ message: "Assignment not found." });
      }

      res.json({ message: "Note deleted successfully.", assignment });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

/**
 * POST /api/resources/personal
 * STUDENT: Create a personal file/resource
 */
router.post(
  "/personal",
  authMiddleware,
  roleMiddleware("student"),
  async (req, res) => {
    try {
      const {
        title,
        description,
        fileUrl,
        externalUrl,
        fileType,
        fileSize,
        instrument,
        level,
        category,
      } = req.body;

      if (!title || !fileType) {
        return res.status(400).json({
          message: "Title and fileType are required.",
        });
      }

      // Must have either fileUrl or externalUrl
      if (!fileUrl && !externalUrl) {
        return res.status(400).json({
          message: "Either fileUrl or externalUrl must be provided.",
        });
      }

      const resource = new Resource({
        title,
        description: description || "",
        fileUrl: fileUrl || "",
        externalUrl: externalUrl || "",
        fileType,
        fileSize: fileSize || 0,
        instrument: instrument || "Other",
        level: level || "Beginner",
        category: category || "",
        uploadedBy: req.user.id,
      });

      await resource.save();
      await resource.populate("uploadedBy", "name profileImage");

      res.status(201).json(resource);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

/**
 * GET /api/resources/personal
 * STUDENT: Get all personal files/resources uploaded by the student
 */
router.get(
  "/personal",
  authMiddleware,
  roleMiddleware("student"),
  async (req, res) => {
    try {
      const resources = await Resource.find({ uploadedBy: req.user.id })
        .populate("uploadedBy", "name profileImage")
        .sort({ createdAt: -1 });

      res.json(resources);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

/**
 * DELETE /api/resources/personal/:id
 * STUDENT: Delete a personal file/resource
 */
router.delete(
  "/personal/:id",
  authMiddleware,
  roleMiddleware("student"),
  async (req, res) => {
    try {
      const resource = await Resource.findById(req.params.id);

      if (!resource) {
        return res.status(404).json({ message: "Resource not found." });
      }

      // Only the owner can delete
      if (resource.uploadedBy.toString() !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized." });
      }

      await resource.deleteOne();

      res.json({ message: "File deleted successfully." });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

export default router;

