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

