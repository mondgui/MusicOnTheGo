# Profile Image Upload Guide

## Current Problem

Right now, when users pick a profile image, the app saves the **local file URI** (like `file:///Users/...`) to the database. This is a temporary path that:
- ❌ Only works on the device where it was picked
- ❌ Gets deleted when the app restarts
- ❌ Won't work on other devices
- ❌ Won't work in production

## Solution: Use Cloud Storage

You need to upload images to a cloud storage service and save the permanent URL. Here are the best options:

### Option 1: Cloudinary (Recommended - Easiest)
- **Free tier**: 25GB storage, 25GB bandwidth/month
- **Easy setup**: Just need API keys
- **Automatic image optimization**: Resizing, compression, etc.

### Option 2: AWS S3
- **Free tier**: 5GB storage, 20,000 GET requests/month
- **More complex setup**: Requires AWS account and configuration
- **More control**: Full control over storage and CDN

### Option 3: Firebase Storage
- **Free tier**: 5GB storage, 1GB/day downloads
- **Good if using Firebase**: Integrates well with Firebase Auth
- **Easy setup**: Similar to Cloudinary

## Quick Fix: Cloudinary Implementation

### Step 1: Install Cloudinary SDK
```bash
cd MusicOnTheGo/frontend
npm install cloudinary-react-native
```

### Step 2: Create Cloudinary Account
1. Go to https://cloudinary.com/users/register/free
2. Sign up for free account
3. Get your:
   - Cloud Name
   - API Key
   - API Secret

### Step 3: Add Environment Variables
Add to your `.env` file:
```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Step 4: Create Upload Endpoint (Backend)
Create `backend/routes/uploadRoutes.js`:
```javascript
import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Upload profile image
router.post("/profile-image", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image provided" });
    }

    // Convert buffer to base64
    const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(base64Image, {
      folder: "profile-images",
      transformation: [
        { width: 400, height: 400, crop: "fill", gravity: "face" },
        { quality: "auto" },
      ],
    });

    res.json({ url: result.secure_url });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ message: "Failed to upload image" });
  }
});

export default router;
```

### Step 5: Update Frontend to Upload Images
In `edit-profile.tsx`, replace the `pickImage` function to upload after picking:

```typescript
const pickImage = async () => {
  try {
    // ... existing permission code ...
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.[0]?.uri) return;

    const imageUri = result.assets[0].uri;
    
    // Upload to backend
    const formData = new FormData();
    formData.append("image", {
      uri: imageUri,
      type: "image/jpeg",
      name: "profile.jpg",
    } as any);

    const uploadResponse = await api("/api/upload/profile-image", {
      method: "POST",
      auth: true,
      body: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    // Save the cloud URL, not the local URI
    setProfileImage(uploadResponse.url);
  } catch (err: any) {
    Alert.alert("Error", err.message || "Failed to upload image");
  }
};
```

## Alternative: Base64 Encoding (Temporary Solution)

If you can't set up cloud storage right now, you can encode images as base64 and store them in the database. **Warning**: This is not recommended for production as it:
- Makes database very large
- Slows down queries
- Has size limits

But it will work for testing. The images will persist because they're stored in the database, not as files.

Would you like me to implement one of these solutions?

