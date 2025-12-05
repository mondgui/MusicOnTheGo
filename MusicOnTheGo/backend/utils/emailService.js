// backend/utils/emailService.js
import nodemailer from "nodemailer";

// Create reusable transporter object using SMTP transport
const createTransporter = () => {
  // For development, you can use Gmail or other SMTP services
  // For production, consider using services like SendGrid, Mailgun, or AWS SES
  
  // Option 1: Gmail (requires app-specific password)
  if (process.env.EMAIL_SERVICE === "gmail") {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD, // App-specific password
      },
    });
  }

  // Option 2: Custom SMTP (works with most email providers)
  if (process.env.SMTP_HOST) {
    const transporterConfig = {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    };

    // SendGrid specific configuration
    if (process.env.SMTP_HOST.includes("sendgrid")) {
      transporterConfig.requireTLS = true;
      // SendGrid uses API key authentication, user should be "apikey"
    }
    // Outlook/Hotmail/Office365 specific configuration
    else if (
      process.env.SMTP_HOST.includes("outlook") ||
      process.env.SMTP_HOST.includes("hotmail") ||
      process.env.SMTP_HOST.includes("office365")
    ) {
      transporterConfig.requireTLS = true;
      transporterConfig.tls = {
        ciphers: "TLSv1.2", // Ensures compatibility with Office365
        rejectUnauthorized: true, // Office365 has valid certificates
      };
      // Note: Nodemailer will automatically use the correct auth method (LOGIN)
      // based on what the server supports. No need to specify authMethod explicitly.
    }

    return nodemailer.createTransport(transporterConfig);
  }

  // Option 3: Development - log email instead of sending (for testing)
  return {
    sendMail: async (options) => {
      console.log("📧 EMAIL (Development Mode - not actually sent):");
      console.log("To:", options.to);
      console.log("Subject:", options.subject);
      console.log("Text:", options.text);
      console.log("HTML:", options.html);
      return { messageId: "dev-mode" };
    },
  };
};

// Create transporter lazily (after dotenv loads)
let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    transporter = createTransporter();
    
    // Debug: Log email configuration (without sensitive data)
    console.log("📧 Email Configuration:");
    console.log("  SMTP_HOST:", process.env.SMTP_HOST || "Not set");
    console.log("  SMTP_PORT:", process.env.SMTP_PORT || "Not set");
    console.log("  EMAIL_USER:", process.env.EMAIL_USER || "Not set");
    console.log("  EMAIL_FROM:", process.env.EMAIL_FROM || "Not set");
    console.log("  EMAIL_PASSWORD:", process.env.EMAIL_PASSWORD ? "***" + process.env.EMAIL_PASSWORD.slice(-4) : "Not set");
    
    // SendGrid specific checks
    if (process.env.SMTP_HOST?.includes("sendgrid")) {
      console.log("  ✅ Using SendGrid");
      if (process.env.EMAIL_USER !== "apikey") {
        console.log("  ⚠️  WARNING: EMAIL_USER should be 'apikey' for SendGrid");
      }
      if (!process.env.EMAIL_PASSWORD?.startsWith("SG.")) {
        console.log("  ⚠️  WARNING: EMAIL_PASSWORD should start with 'SG.' for SendGrid");
      }
      console.log("  💡 Make sure your sender email is verified in SendGrid dashboard");
    }
  }
  return transporter;
};

/**
 * Send password reset email
 */
export const sendPasswordResetEmail = async (email, resetToken, resetUrl) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER || "noreply@musiconthego.com",
    to: email,
    subject: "Reset Your Password - MusicOnTheGo",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #FF9076, #FF6A5C); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #fff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; }
            .button { display: inline-block; background: #FF6A5C; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎵 MusicOnTheGo</h1>
            </div>
            <div class="content">
              <h2>Reset Your Password</h2>
              <p>You requested to reset your password. Click the button below to create a new password:</p>
              <a href="${resetUrl}" class="button">Reset Password</a>
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #666;">${resetUrl}</p>
              <p><strong>This link will expire in 1 hour.</strong></p>
              <p>If you didn't request a password reset, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} MusicOnTheGo. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
      Reset Your Password - MusicOnTheGo
      
      You requested to reset your password. Click the link below to create a new password:
      
      ${resetUrl}
      
      This link will expire in 1 hour.
      
      If you didn't request a password reset, please ignore this email.
    `,
  };

  try {
    console.log("📤 Attempting to send email...");
    console.log("   From:", mailOptions.from);
    console.log("   To:", mailOptions.to);
    console.log("   Subject:", mailOptions.subject);
    
    const info = await getTransporter().sendMail(mailOptions);
    console.log("✅ Password reset email sent successfully!");
    console.log("   Message ID:", info.messageId);
    console.log("   Response:", info.response || "N/A");
    console.log("📧 Email sent to:", email);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Error sending password reset email:", error);
    console.error("Error details:", {
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response,
    });
    
    // Provide helpful troubleshooting tips for common errors
    if (error.code === "EAUTH" && error.response?.includes("basic authentication")) {
      console.error("\n💡 Troubleshooting Tips:");
      console.error("1. Verify your app password is correct (not your regular password)");
      console.error("2. Make sure Two-Step Verification is enabled in your Microsoft account");
      console.error("3. Check that EMAIL_USER matches your full email address exactly");
      console.error("4. See EMAIL_SETUP.md for detailed troubleshooting steps");
      console.error("5. Consider switching to SendGrid (recommended - see EMAIL_SETUP.md)");
    }
    
    // SendGrid specific error: unverified sender
    if (error.code === "EMESSAGE" && error.response?.includes("verified Sender Identity")) {
      console.error("\n🔴 SENDGRID ERROR: Sender email not verified!");
      console.error("📧 Your sender email:", mailOptions.from);
      console.error("\n✅ To fix this:");
      console.error("1. Go to https://app.sendgrid.com/");
      console.error("2. Navigate to Settings → Sender Authentication");
      console.error("3. Click 'Verify a Single Sender'");
      console.error("4. Enter your email:", mailOptions.from);
      console.error("5. Fill in the form and submit");
      console.error("6. Check your email inbox for verification link");
      console.error("7. Click the verification link");
      console.error("\n💡 Once verified, try sending the email again!");
      console.error("📚 See SENDGRID_TROUBLESHOOTING.md for more details");
    }
    
    throw new Error(`Failed to send password reset email: ${error.message}`);
  }
};

/**
 * Send password reset confirmation email
 */
export const sendPasswordResetConfirmation = async (email) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER || "noreply@musiconthego.com",
    to: email,
    subject: "Password Reset Successful - MusicOnTheGo",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #FF9076, #FF6A5C); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #fff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎵 MusicOnTheGo</h1>
            </div>
            <div class="content">
              <h2>Password Reset Successful</h2>
              <p>Your password has been successfully reset.</p>
              <p>If you did not make this change, please contact support immediately.</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} MusicOnTheGo. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
      Password Reset Successful - MusicOnTheGo
      
      Your password has been successfully reset.
      
      If you did not make this change, please contact support immediately.
    `,
  };

  try {
    const info = await getTransporter().sendMail(mailOptions);
    console.log("✅ Password reset confirmation email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Error sending confirmation email:", error);
    // Don't throw error for confirmation email - it's not critical
    return { success: false };
  }
};

