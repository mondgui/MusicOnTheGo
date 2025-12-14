import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Configure Cloudinary function (call this before each upload to ensure env vars are loaded)
const configureCloudinary = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
};

// Configure multer for memory storage
const storage = multer.memoryStorage();

// Upload configuration for profile images (5MB limit, images only)
const uploadProfile = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
});

// Upload configuration for resource files
// Increased limits for video/audio recordings:
// - Videos: 1GB (for long performance recordings)
// - Audio: 500MB (for long audio recordings)
// - Images/PDFs: 20MB (sufficient for documents)
const uploadResource = multer({
  storage,
  limits: {
    fileSize: 1024 * 1024 * 1024, // 1GB limit for resources (to accommodate long video/audio recordings)
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'application/pdf', // PDFs
      'image/', // Images
      'audio/', // Audio files
      'video/', // Video files
    ];
    
    if (allowedMimes.some(mime => file.mimetype.startsWith(mime))) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, image, audio, and video files are allowed!'), false);
    }
  },
});

// Upload profile image
router.post('/profile-image', authMiddleware, uploadProfile.single('file'), async (req, res) => {
  try {
    // Check Cloudinary configuration with detailed error
    const missing = [];
    if (!process.env.CLOUDINARY_CLOUD_NAME) missing.push('CLOUDINARY_CLOUD_NAME');
    if (!process.env.CLOUDINARY_API_KEY) missing.push('CLOUDINARY_API_KEY');
    if (!process.env.CLOUDINARY_API_SECRET) missing.push('CLOUDINARY_API_SECRET');
    
    if (missing.length > 0) {
      // // console.error('Missing Cloudinary environment variables:', missing.join(', '));
      // console.error('Environment check:', {
      //   CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME ? 'exists' : 'missing',
      //   CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY ? 'exists' : 'missing',
      //   CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET ? 'exists' : 'missing',
      // });
      //console.error('Make sure these are set in your .env file in the backend folder');
      return res.status(500).json({ 
        message: `Server configuration error: Missing Cloudinary credentials: ${missing.join(', ')}`,
        hint: 'Add these to your backend/.env file'
      });
    }

    if (!req.file) {
      //console.error('No file received in request');
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // console.log('File received:', {
    //   fieldname: req.file.fieldname,
    //   originalname: req.file.originalname,
    //   mimetype: req.file.mimetype,
    //   size: req.file.size,
    // });

    // Configure Cloudinary right before upload (ensures env vars are loaded)
    configureCloudinary();
    
    // Verify Cloudinary config is set (double-check)
    const config = cloudinary.config();
    if (!config.cloud_name || !config.api_key || !config.api_secret) {
      //console.error('Cloudinary config not properly initialized');
      // console.error('Config values:', {
      //   cloud_name: config.cloud_name ? 'set' : 'missing',
      //   api_key: config.api_key ? 'set' : 'missing',
      //   api_secret: config.api_secret ? 'set' : 'missing',
      // });
      return res.status(500).json({ 
        message: 'Cloudinary configuration error. Please check your .env file.',
        hint: 'Ensure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET are set'
      });
    }

    // Convert buffer to base64 (simpler and more reliable than streams)
    const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(base64Image, {
      folder: 'profile-images',
      transformation: [
        { width: 400, height: 400, crop: 'fill', gravity: 'face' },
        { quality: 'auto' },
      ],
    });

    //console.log('Upload successful:', result.secure_url);
    res.json({ url: result.secure_url });
  } catch (error) {
    //console.error('Upload error:', error);
    res.status(500).json({
      message: 'Failed to upload image',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * POST /api/uploads/resource-file
 * Upload a resource file (PDF, image, audio, video)
 * Returns: { url, fileSize, fileType }
 */
router.post('/resource-file', authMiddleware, (req, res, next) => {
  uploadResource.single('file')(req, res, (err) => {
    if (err) {
      console.error('[Upload] Multer error:', err);
      return res.status(400).json({
        message: err.message || 'File upload error',
        error: process.env.NODE_ENV === 'development' ? err.stack : undefined,
      });
    }
    next();
  });
}, async (req, res) => {
  try {
    // Check Cloudinary configuration
    const missing = [];
    if (!process.env.CLOUDINARY_CLOUD_NAME) missing.push('CLOUDINARY_CLOUD_NAME');
    if (!process.env.CLOUDINARY_API_KEY) missing.push('CLOUDINARY_API_KEY');
    if (!process.env.CLOUDINARY_API_SECRET) missing.push('CLOUDINARY_API_SECRET');
    
    if (missing.length > 0) {
      return res.status(500).json({ 
        message: `Server configuration error: Missing Cloudinary credentials: ${missing.join(', ')}`,
        hint: 'Add these to your backend/.env file'
      });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Log file size in MB for debugging
    const fileSizeMB = (req.file.size / (1024 * 1024)).toFixed(2);
    console.log('[Upload] File received:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: `${fileSizeMB}MB`,
      fieldname: req.file.fieldname,
    });

    // Configure Cloudinary right before upload
    configureCloudinary();
    
    // Verify Cloudinary config is set
    const config = cloudinary.config();
    if (!config.cloud_name || !config.api_key || !config.api_secret) {
      return res.status(500).json({ 
        message: 'Cloudinary configuration error. Please check your .env file.',
        hint: 'Ensure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET are set'
      });
    }

    // Determine file type based on mimetype
    let fileType = 'pdf';
    if (req.file.mimetype.startsWith('image/')) {
      fileType = 'image';
    } else if (req.file.mimetype.startsWith('audio/')) {
      fileType = 'audio';
    } else if (req.file.mimetype.startsWith('video/')) {
      fileType = 'video';
    }

    console.log('[Upload] Detected file type:', fileType);

    // For large files (videos/audio), use stream upload instead of base64
    // Base64 encoding can cause memory issues for large files
    let result;
    
    if (fileType === 'video' || fileType === 'audio') {
      // For video/audio, upload directly from buffer using upload_stream
      const uploadOptions = {
        folder: 'resources',
        resource_type: 'video', // Cloudinary uses 'video' for both video and audio
      };

      console.log('[Upload] Uploading video/audio to Cloudinary...');
      
      // Convert buffer to stream for upload_stream
      const bufferStream = new Readable();
      bufferStream.push(req.file.buffer);
      bufferStream.push(null); // End the stream
      
      // Use upload_stream for better memory efficiency
      result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            if (error) {
              console.error('[Upload] Cloudinary upload error:', error);
              reject(error);
            } else {
              resolve(result);
            }
          }
        );
        bufferStream.pipe(uploadStream);
      });
    } else {
      // For images and PDFs, use base64 (smaller files)
      const base64File = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      
      const uploadOptions = {
        folder: 'resources',
        resource_type: fileType === 'pdf' ? 'raw' : 'image',
      };

      // For images, add transformations
      if (fileType === 'image') {
        uploadOptions.transformation = [
          { quality: 'auto' },
        ];
      }

      console.log('[Upload] Uploading image/PDF to Cloudinary...');
      result = await cloudinary.uploader.upload(base64File, uploadOptions);
    }

    console.log('[Upload] Upload successful:', result.secure_url);

    res.json({ 
      url: result.secure_url,
      fileSize: req.file.size,
      fileType: fileType,
    });
  } catch (error) {
    console.error('[Upload] Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      file: req.file ? {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
      } : 'No file',
    });
    
    res.status(500).json({
      message: 'Failed to upload resource file',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
});

export default router;




// import express from "express";
// import multer from "multer";
// import { v2 as cloudinary } from "cloudinary";
// import authMiddleware from "../middleware/authMiddleware.js";

// const router = express.Router();

// // Configure Cloudinary
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// // Configure multer for memory storage
// const storage = multer.memoryStorage();
// const upload = multer({ 
//   storage,
//   limits: {
//     fileSize: 10 * 1024 * 1024, // 10MB limit
//   },
//   fileFilter: (req, file, cb) => {
//     // Accept only images
//     if (file.mimetype.startsWith('image/')) {
//       cb(null, true);
//     } else {
//       cb(new Error('Only image files are allowed'), false);
//     }
//   },
// });

// // Error handler for multer
// const handleMulterError = (err, req, res, next) => {
//   if (err instanceof multer.MulterError) {
//     if (err.code === 'LIMIT_FILE_SIZE') {
//       return res.status(400).json({ message: 'File too large. Maximum size is 10MB.' });
//     }
//     return res.status(400).json({ message: `Upload error: ${err.message}` });
//   }
//   if (err) {
//     return res.status(400).json({ message: err.message || 'File upload error' });
//   }
//   next();
// };

// // Upload profile image
// router.post("/profile-image", authMiddleware, upload.single("image"), handleMulterError, async (req, res) => {
//   try {
//     // Check Cloudinary configuration
//     if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
//       console.error("Cloudinary credentials missing");
//       return res.status(500).json({ message: "Server configuration error: Cloudinary credentials not set" });
//     }

//     if (!req.file) {
//       console.error("No file received in request");
//       console.error("Request body:", req.body);
//       console.error("Request files:", req.files);
//       return res.status(400).json({ message: "No image provided" });
//     }

//     console.log("File received:", {
//       fieldname: req.file.fieldname,
//       originalname: req.file.originalname,
//       mimetype: req.file.mimetype,
//       size: req.file.size,
//     });

//     // Convert buffer to base64
//     const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;

//     // Upload to Cloudinary
//     const result = await cloudinary.uploader.upload(base64Image, {
//       folder: "profile-images",
//       transformation: [
//         { width: 400, height: 400, crop: "fill", gravity: "face" },
//         { quality: "auto" },
//       ],
//     });

//     console.log("Upload successful:", result.secure_url);
//     res.json({ url: result.secure_url });
//   } catch (err) {
//     console.error("Upload error details:", {
//       message: err.message,
//       stack: err.stack,
//       response: err.response?.data,
//     });
//     res.status(500).json({ 
//       message: "Failed to upload image",
//       error: process.env.NODE_ENV === "development" ? err.message : undefined
//     });
//   }
// });

// export default router;