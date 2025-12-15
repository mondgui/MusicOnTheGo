# Setup & Configuration Guide

This guide covers all setup steps, configuration, and troubleshooting for external services and network connectivity.

---

# ============================================
# CLOUDINARY SETUP
# ============================================

## ✅ What You've Already Done:
1. ✅ Got Cloudinary credentials (Cloud Name, API Key, API Secret)
2. ✅ Created `backend/routes/uploadRoutes.js`
3. ✅ Added environment variables to `.env`
4. ✅ Registered the route in `server.js`
5. ✅ Installed `multer` and `cloudinary` packages
6. ✅ Fixed `uploadRoutes.js` (removed extra code)
7. ✅ Added import for `uploadRoutes` in `server.js`
8. ✅ Updated `api.ts` to handle FormData
9. ✅ Updated both `edit-profile.tsx` files to upload images

## 🔧 Final Steps:

### Step 1: Verify Your `.env` File
Make sure your `MusicOnTheGo/backend/.env` file has these variables:
```
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

### Step 2: Restart Your Backend Server
```bash
cd MusicOnTheGo/backend
npm run dev
```
Or if using `npm start`:
```bash
npm start
```

### Step 3: Test the Upload
1. Open your app in Expo
2. Go to Edit Profile (either teacher or student)
3. Tap on the profile picture
4. Select an image from your gallery
5. Wait for the upload to complete
6. You should see "Profile picture uploaded successfully!"
7. Save your profile

### Step 4: Verify It Works
1. After saving, check that the image appears
2. **Restart the app** (this is the key test!)
3. Log back in
4. The profile picture should still be there! 🎉

## 🐛 Troubleshooting:

### If upload fails:
1. **Check backend console** for error messages
2. **Verify `.env` variables** are correct (no quotes, no spaces)
3. **Check Cloudinary dashboard** - images should appear in "Media Library" under "profile-images" folder
4. **Check network** - make sure backend is running and accessible

### Common Issues:

**Error: "No image provided"**
- Make sure you're selecting an image (not canceling)
- Check that FormData is being created correctly

**Error: "Failed to upload image"**
- Check Cloudinary credentials in `.env`
- Verify backend server is running
- Check backend console for detailed error

**Error: Network request failed**
- Make sure backend server is running
- Check that `EXPO_PUBLIC_API_URL` in frontend `.env` points to correct backend URL

## 📝 What Happens Now:

1. **When user picks image**: Image is uploaded to Cloudinary immediately
2. **Cloudinary returns URL**: Like `https://res.cloudinary.com/your-cloud/image/upload/...`
3. **URL is saved to database**: This URL persists forever (unlike local file paths)
4. **Image displays from Cloudinary**: Works on any device, anytime

## ✨ You're All Set!

The implementation is complete. Just restart your backend server and test it out!

---

# ============================================
# PROFILE IMAGE UPLOAD GUIDE
# ============================================

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

---

# ============================================
# EMAIL SETUP GUIDE
# ============================================

# 📧 Complete Email Setup Guide

This guide covers everything you need to set up email sending for password reset functionality in MusicOnTheGo.

---

# 🚀 Quick Start: SendGrid (Recommended)

SendGrid is the easiest and most reliable option for sending transactional emails. It's free (100 emails/day) and designed specifically for apps.

## Step 1: Create SendGrid Account

1. Go to https://signup.sendgrid.com/
2. Sign up for a free account (100 emails/day free)
3. Verify your email address

## Step 2: Create API Key

1. In SendGrid dashboard, go to **Settings** → **API Keys**
2. Click **Create API Key**
3. Name it: `MusicOnTheGo Backend`
4. Select **Full Access** (or at least "Mail Send" permissions)
5. Click **Create & View**
6. **COPY THE API KEY** - you'll only see it once!

## Step 3: Update Your `.env` File

Replace your email settings with SendGrid:

```env
# SendGrid SMTP Configuration
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
EMAIL_USER=apikey
EMAIL_PASSWORD=SG.your-actual-api-key-here
EMAIL_FROM=musiconthego.app@outlook.com
FRONTEND_URL=http://localhost:8081
```

**Important:**
- `EMAIL_USER` must be exactly `apikey` (not your email)
- `EMAIL_PASSWORD` is your SendGrid API key (starts with `SG.`)
- `EMAIL_FROM` can be any email address you own

## Step 4: Verify Sender (REQUIRED)

**⚠️ IMPORTANT: You MUST verify your sender email before SendGrid will send emails!**

1. In SendGrid dashboard, go to **Settings** → **Sender Authentication**
2. Click **Verify a Single Sender**
3. Enter your email address (e.g., `musiconthego.app@gmail.com`)
4. Fill in the required information (name, address, etc.)
5. Check your email inbox for verification email
6. Click the verification link

**Until you verify the sender, SendGrid will reject emails with error: "550 The from address does not match a verified Sender Identity"**

This also prevents emails from going to spam.

## Step 5: Restart Your Server

```bash
# Stop the server (Ctrl+C)
npm run dev
```

## That's It!

Your password reset emails should now work. SendGrid is much more reliable than Outlook for sending transactional emails.

---

# 🔧 SendGrid Troubleshooting

If you're not receiving emails even though there are no errors, check these common issues:

## 1. Verify Sender Email in SendGrid

**This is the #1 most common issue!**

SendGrid requires you to verify the sender email address before you can send emails.

### Steps to Verify:

1. Go to https://app.sendgrid.com/
2. Navigate to **Settings** → **Sender Authentication**
3. Click **Verify a Single Sender**
4. Enter your email address (e.g., `musiconthego.app@gmail.com`)
5. Fill in the required information
6. Check your email inbox for a verification email
7. Click the verification link

**Important:** Until you verify the sender, SendGrid will reject emails with error: "550 The from address does not match a verified Sender Identity"

## 2. Check SendGrid Activity Feed

1. Go to https://app.sendgrid.com/
2. Navigate to **Activity** in the left sidebar
3. Look for recent email attempts
4. Check the status:
   - ✅ **Delivered** - Email was sent successfully
   - ⚠️ **Bounced** - Email address doesn't exist or is invalid
   - ⚠️ **Blocked** - Email was blocked (check reason)
   - ⚠️ **Dropped** - Email was dropped (often due to unverified sender)

## 3. Check Your .env Configuration

Make sure your `.env` has:

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
EMAIL_USER=apikey
EMAIL_PASSWORD=SG.your-api-key-here
EMAIL_FROM=your-verified-email@domain.com
FRONTEND_URL=http://localhost:8081
```

**Important:**
- `EMAIL_USER` must be exactly `apikey` (lowercase)
- `EMAIL_PASSWORD` is your SendGrid API key (starts with `SG.`)
- `EMAIL_FROM` must be a verified sender email in SendGrid

## 4. Check API Key Permissions

1. Go to **Settings** → **API Keys**
2. Click on your API key
3. Make sure it has **Mail Send** permissions (or Full Access)

## 5. Check Spam Folder

Sometimes emails end up in spam, especially if:
- The sender isn't verified
- The email content looks spammy
- The recipient's email provider is strict

## 6. Check Server Logs

When you request a password reset, you should see:

```
📧 Email Configuration:
  SMTP_HOST: smtp.sendgrid.net
  SMTP_PORT: 587
  EMAIL_USER: apikey
  EMAIL_FROM: musiconthego.app@gmail.com
  EMAIL_PASSWORD: ***OcOc

📤 Attempting to send email...
   From: musiconthego.app@gmail.com
   To: user@example.com
   Subject: Reset Your Password - MusicOnTheGo

✅ Password reset email sent successfully!
   Message ID: [some-id]
   📧 Email sent to: user@example.com
```

If you see errors instead, check the error message.

## 7. Test with SendGrid's Test Email

1. Go to **Email API** → **Mail Send**
2. Use the test form to send an email
3. If this works, your SendGrid account is fine - the issue is in your code
4. If this doesn't work, check your SendGrid account settings

## 8. Check Rate Limits

SendGrid free tier allows:
- **100 emails/day**

If you've exceeded this, emails will be rejected. Check your usage in the SendGrid dashboard.

## 9. Domain Authentication (Optional but Recommended)

For production, consider setting up domain authentication:
1. Go to **Settings** → **Sender Authentication**
2. Click **Authenticate Your Domain**
3. Follow the DNS setup instructions

This improves deliverability and prevents emails from going to spam.

## SendGrid Quick Checklist

- [ ] Sender email is verified in SendGrid
- [ ] API key has Mail Send permissions
- [ ] `.env` has correct SendGrid configuration
- [ ] `EMAIL_USER` is exactly `apikey`
- [ ] `EMAIL_PASSWORD` starts with `SG.`
- [ ] `EMAIL_FROM` matches verified sender email
- [ ] Checked SendGrid Activity feed for email status
- [ ] Checked spam folder
- [ ] Server logs show "✅ Password reset email sent successfully!"
- [ ] Haven't exceeded 100 emails/day limit

## Still Not Working?

1. **Check SendGrid Activity Feed** - This will show you exactly what happened to your email
2. **Verify the sender email** - This is the #1 cause of silent failures
3. **Check server logs** - Look for the detailed email sending logs
4. **Test with SendGrid's web interface** - Send a test email from the dashboard

---

# 📬 Alternative: Gmail Setup

If you prefer to use Gmail instead of SendGrid:

## Step 1: Enable 2-Step Verification

1. Go to https://myaccount.google.com/
2. Click **Security** → **2-Step Verification** (enable it if not already)
3. Wait a few minutes for 2FA to fully activate

## Step 2: Generate App Password

1. Scroll down and click **App passwords** (if available)
2. Select **Mail** and **Other (Custom name)**
3. Name it "MusicOnTheGo App"
4. Copy the 16-character password

**Note:** If you don't see "App passwords" after enabling 2FA, try:
- Make sure 2-Step Verification is fully enabled (may take a few minutes)
- Use a Google Workspace account (personal Gmail sometimes has restrictions)
- Or use SendGrid instead (recommended)

## Step 3: Add to `.env` File

```env
# Gmail Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop
EMAIL_FROM=your-email@gmail.com
FRONTEND_URL=http://localhost:8081
```

**Important:** Replace `your-email@gmail.com` with YOUR email, and `abcd efgh ijkl mnop` with YOUR app password.

---

# 📮 Alternative: Outlook/Hotmail Setup

Outlook is often easier to set up than Gmail, but can have authentication issues.

## Step 1: Enable Two-Step Verification

1. Go to https://account.microsoft.com/security
2. Sign in with your Outlook/Hotmail email
3. Click **Advanced security options**
4. Under "Two-step verification", click **Turn on**
5. Follow the prompts to set it up (usually via phone or authenticator app)

## Step 2: Create App Password

1. After 2FA is enabled, go back to **Advanced security options**
2. Scroll down to **App passwords**
3. Click **Create a new app password**
4. Name it "MusicOnTheGo App" or "Node.js App"
5. Click **Generate**
6. **Copy the password immediately** (you won't see it again!)
7. It will look like: `abcd-efgh-ijkl-mnop` (16 characters with dashes)

## Step 3: Add to `.env` File

```env
# Outlook/Hotmail SMTP Configuration
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_SECURE=false
EMAIL_USER=yourname@outlook.com
EMAIL_PASSWORD=abcd-efgh-ijkl-mnop
EMAIL_FROM=yourname@outlook.com
FRONTEND_URL=http://localhost:8081
```

**Important:** 
- Use `smtp.office365.com` (not `smtp-mail.outlook.com`) - this is Microsoft's official endpoint
- Replace `yourname@outlook.com` with YOUR Outlook email
- Replace `abcd-efgh-ijkl-mnop` with YOUR app password from Step 2
- Keep the dashes in the Outlook app password
- `SMTP_SECURE=false` is correct for port 587 (uses STARTTLS, not implicit SSL)

---

# 🔧 Troubleshooting Outlook Issues

If you're getting "basic authentication is disabled" errors with Outlook:

## Important Clarification

**Microsoft disabled basic authentication for enterprise/tenant accounts (Microsoft 365), NOT for personal Outlook.com accounts.**

Your personal Outlook.com account should work with SMTP AUTH using an app password.

## Common Issues & Solutions

### 1. App Password Format

Outlook app passwords are usually formatted with dashes:
- ✅ Correct: `abcd-efgh-ijkl-mnop`
- ❌ Wrong: `abcd efgh ijkl mnop` (spaces)
- ❌ Wrong: `abcdefghijklmnop` (no dashes - might work but less common)

**Action:** Make sure your app password in `.env` matches exactly what Microsoft generated (including dashes).

### 2. Verify App Password is Correct

1. Go to https://account.microsoft.com/security
2. Sign in with your Outlook email
3. Go to **Security** → **Advanced security options**
4. Under **App passwords**, verify you're using the correct one
5. If unsure, generate a new app password and update `.env`

### 3. Check Account Security Settings

1. Go to https://account.microsoft.com/security
2. Make sure **Two-step verification** is enabled (required for app passwords)
3. Check if there are any security alerts blocking the account

### 4. Check for Rate Limiting

Outlook.com has rate limits:
- **Personal accounts**: ~300 emails/day
- If you hit the limit, you'll get authentication errors

**Solution:** Wait a few hours or switch to SendGrid for production.

### 5. Verify Email Address Format

Make sure `EMAIL_USER` and `EMAIL_FROM` are exactly:
- ✅ `yourname@outlook.com`
- ❌ NOT `yourname@hotmail.com` (different domain)
- ❌ NOT `yourname@live.com` (different domain)

## If It Still Doesn't Work

If you've tried all the above and still get "basic authentication disabled":

1. **Double-check the app password** - Generate a new one
2. **Wait 15 minutes** - Sometimes changes take time to propagate
3. **Switch to SendGrid** - It's more reliable for production apps (see SendGrid section above)

---

# 🧪 Development Mode (No Email Setup Needed)

If you don't configure email, the app will:
- ✅ Still generate reset tokens
- ✅ Still create reset links
- ✅ Log the reset link to console (you can copy and use it)
- ❌ NOT actually send emails

This is perfect for testing!

---

# 📋 How It Works

```
┌─────────────────────────────────────────┐
│  User requests password reset           │
│  (student@example.com)                 │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│  Your app uses YOUR email account       │
│  (musiconthego.app@gmail.com)          │
│  to send reset link                     │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│  Email sent TO: student@example.com    │
│  Email sent FROM: musiconthego.app@... │
└─────────────────────────────────────────┘
```

## What Email Do I Use?

You need **ONE email account** that your app will use to **send** emails to users.

Think of it like this:
- **Your app's email** (in `.env`) = The email account your app uses to send emails
- **User's email** (in database) = Where the reset link gets sent

### Example Scenario

1. **You set up ONE email account** (e.g., `musiconthego.app@gmail.com`)
   - This is YOUR app's email account
   - You configure this in `.env`

2. **User requests password reset**
   - Student: `student@example.com` requests reset
   - Your app sends email FROM `musiconthego.app@gmail.com` TO `student@example.com`
   - Teacher: `teacher@example.com` requests reset  
   - Your app sends email FROM `musiconthego.app@gmail.com` TO `teacher@example.com`

---

# ❓ Common Questions

**Q: Do I need a different email for each user?**  
A: No! You use ONE email account for your app. Users receive emails at their own email addresses.

**Q: Can I use my personal Gmail?**  
A: Yes, for testing. For production, consider a dedicated email account or SendGrid.

**Q: What if I don't want to set up email?**  
A: That's fine! The app works in development mode - check the console for reset links.

**Q: Will this work for all users?**  
A: Yes! Any user (student or teacher) can request a reset, and your app will send them an email using YOUR sender account.

**Q: Gmail App Passwords not showing up?**  
A: This is common with personal Gmail accounts. Try SendGrid instead - it's easier and more reliable.

**Q: Can I use Outlook instead of Gmail?**  
A: Yes! But Outlook can have authentication issues. SendGrid is recommended for production.

**Q: Why is SendGrid recommended?**  
A: Even though Outlook.com *should* work:
- ✅ **More reliable** - Purpose-built for transactional emails
- ✅ **Better deliverability** - Less likely to go to spam
- ✅ **No rate limits** - Free tier: 100 emails/day
- ✅ **Better analytics** - Track opens, clicks, bounces
- ✅ **Production-ready** - Used by thousands of apps

---

# 🧪 Testing

1. Request password reset from the app
2. Check your email (or console logs in dev mode)
3. Click the reset link
4. Enter new password
5. Log in with new password

## Expected Server Output

When email is configured correctly, you should see:
```
✅ Password reset email sent: [message-id]
📧 Email sent to: [user-email]
```

If you see authentication errors, check the troubleshooting section above.

---

# 📝 Other Email Providers

## Mailgun (Free tier: 5,000 emails/month)

```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_SECURE=false
EMAIL_USER=your-mailgun-smtp-username
EMAIL_PASSWORD=your-mailgun-smtp-password
EMAIL_FROM=your-email@domain.com
FRONTEND_URL=http://localhost:8081
```

## AWS SES (Very cheap, pay per email)

- Requires AWS account setup
- More complex but very reliable
- See AWS SES documentation for setup

## Yahoo

```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_SECURE=false
EMAIL_USER=your-email@yahoo.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=your-email@yahoo.com
FRONTEND_URL=http://localhost:8081
```

---

# 🔐 Frontend URL Configuration

Make sure `FRONTEND_URL` matches your frontend URL. 

**For development:**
```env
FRONTEND_URL=http://localhost:8081
```

**For production:**
```env
FRONTEND_URL=https://yourdomain.com
```

This is used to generate the password reset links that are sent to users.

---

# 📚 Summary

**Recommended Setup:**
1. ✅ Use **SendGrid** (free, reliable, easy)
2. ✅ Create API key
3. ✅ Update `.env` with SendGrid settings
4. ✅ Restart server
5. ✅ Test password reset

**Alternative Options:**
- Gmail (works but can be finicky)
- Outlook (works but can have auth issues)
- Mailgun (good free tier)
- AWS SES (production-grade)

**For Development:**
- No email setup needed - links will be logged to console

---

# ============================================
# NETWORK TROUBLESHOOTING
# ============================================

# Network Request Failed - Troubleshooting Guide

## Error: "Network request failed"

This error means your app cannot reach the backend server. Follow these steps:

## Step 1: Verify Backend Server is Running

1. Open a terminal and navigate to the backend folder:
   ```bash
   cd MusicOnTheGo/backend
   ```

2. Start the server:
   ```bash
   npm run dev
   ```

3. You should see:
   ```
   ✅ Connected to MongoDB Atlas
   🚀 Server running on port 5050
   ```

4. Test the server in your browser:
   - Open: `http://localhost:5050`
   - You should see: "Welcome to MusicOnTheGo Backend API!"

## Step 2: Check Your API URL Configuration

### For iOS Simulator (Mac):
- ✅ Uses: `http://localhost:5050` (default)
- No configuration needed

### For Android Emulator:
- ✅ Uses: `http://10.0.2.2:5050` (default)
- No configuration needed

### For Physical Device (iPhone/Android):
- ❌ `localhost` won't work!
- You need your computer's IP address

#### Find Your IP Address:

**On Mac:**
```bash
ipconfig getifaddr en0
# or
ifconfig | grep "inet " | grep -v 127.0.0.1
```

**On Windows:**
```bash
ipconfig
# Look for IPv4 Address (usually 192.168.x.x)
```

**On Linux:**
```bash
hostname -I
# or
ip addr show
```

#### Set the API URL:

1. Create or edit `.env` file in `MusicOnTheGo/frontend/`:
   ```
   EXPO_PUBLIC_API_URL=http://YOUR_IP_ADDRESS:5050
   ```
   
   Example:
   ```
   EXPO_PUBLIC_API_URL=http://192.168.1.100:5050
   ```

2. **Restart Expo** after changing `.env`:
   ```bash
   # Stop Expo (Ctrl+C)
   # Then restart:
   npx expo start -c
   ```

## Step 3: Verify Network Connection

1. **Both devices must be on the same WiFi network**
   - Your computer and phone must be on the same network
   - Check WiFi settings on both devices

2. **Check Firewall**
   - Make sure your computer's firewall allows connections on port 5050
   - On Mac: System Settings → Network → Firewall
   - On Windows: Windows Defender Firewall

3. **Test Connection**
   - On your phone's browser, try: `http://YOUR_IP:5050`
   - You should see the backend welcome message
   - If not, the server isn't reachable from your phone

## Step 4: Check Backend CORS Configuration

Make sure your backend allows requests from your frontend. Check `MusicOnTheGo/backend/server.js`:

```javascript
app.use(cors()); // This should allow all origins in development
```

## Step 5: Check Console Logs

The app now logs the API URL being used. Check your Expo console for:
```
[API] POST http://localhost:5050/api/uploads/profile-image
```

This will show you:
- What URL is being used
- What method is being called
- The platform (iOS/Android)

## Common Issues & Solutions

### Issue: "Network request failed" on physical device
**Solution:** Set `EXPO_PUBLIC_API_URL` to your computer's IP address (not localhost)

### Issue: Server not reachable from phone
**Solution:** 
1. Check both devices are on same WiFi
2. Check firewall settings
3. Try accessing `http://YOUR_IP:5050` in phone's browser

### Issue: Works on simulator but not physical device
**Solution:** Simulators use `localhost`, physical devices need your IP address

### Issue: Backend shows connection but request fails
**Solution:** Check CORS configuration in `server.js`

## Quick Test

1. **Backend running?** → Visit `http://localhost:5050` in browser
2. **On same network?** → Check WiFi on both devices
3. **Correct IP?** → Check `.env` file has correct IP
4. **Firewall blocking?** → Temporarily disable to test

## Still Not Working?

1. Check the Expo console for the exact URL being used
2. Check the backend console for incoming requests
3. Try using `http://` instead of `https://`
4. Make sure port 5050 is not blocked
5. Try a different port (change in `server.js` and `.env`)

---

**Last Updated**: Based on current codebase analysis

