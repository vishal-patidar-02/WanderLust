const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, 
  auth: {
    user: process.env.EMAIL_USER, //  Gmail address
    pass: process.env.APP_PASSWORD // App password 
  },
});

const sendVerificationEmail = async (email, verificationLink) => {
    const mailOptions = {
      to: email,
      from: `"WanderLust" <${process.env.EMAIL_USER}>`,
      subject: 'Email Verification',
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; color: #333; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
        <div style="text-align: center; padding: 20px 0;">
          <h1 style="color: #4CAF50; margin-bottom: 10px;">Welcome to WanderLust</h1>
          <p style="font-size: 16px; color: #555;">Your gateway to amazing travel experiences awaits!</p>
        </div>
        <div style="padding: 20px; text-align: center;">
          <p style="font-size: 16px; line-height: 1.6; color: #333;">
            We're excited to have you join us! To complete your registration, please verify your email by clicking the button below:
          </p>
          <a href="${verificationLink}" rel="opener" style="display: inline-block; margin: 20px 0; padding: 10px 20px; font-size: 16px; color: #ffffff; background-color: #4CAF50; text-decoration: none; border-radius: 5px;">Verify My Email</a>
          <p style="font-size: 14px; color: #777;">
            If you did not sign up for WanderLust, please ignore this email or contact our support team.
          </p>
        </div>
        <div style="text-align: center; margin-top: 20px; font-size: 14px; color: #999;">
          <p>&copy; ${new Date().getFullYear()} WanderLust. All rights reserved.</p>
          <p>
            Need help? Contact us at 
            <a href="mailto:support@wanderlust.com" style="color: #4CAF50; text-decoration: none;">support@wanderlust.com</a>
          </p>
        </div>
      </div>
    `
    };

    transporter.sendMail(mailOptions);
};

module.exports = {sendVerificationEmail}
