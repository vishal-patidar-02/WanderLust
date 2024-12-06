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

const sendOtpEmail = async (email, username, otp) => {
    const mailOptions = {
      to: email,
      from: `"WanderLust" <${process.env.EMAIL_USER}>`,
      subject: 'Email Verification',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; color: #333; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
      <div style="text-align: center; padding: 20px 0;">
        <h1 style="color: #4CAF50; margin-bottom: 10px;">Hello, ${username}!</h1>
        <p style="font-size: 16px; color: #555;">We received a request to reset your password for your WanderLust account.</p>
      </div>
      <div style="padding: 20px; text-align: center; background-color: #fff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
        <p style="font-size: 16px; color: #333; margin-bottom: 10px;">
          Use the following OTP to reset your password:
        </p>
        <h2 style="font-size: 32px; color: #4CAF50; margin: 10px 0;">${otp}</h2>
      </div>
      <div style="padding: 20px; text-align: center;">
        <p style="font-size: 16px; line-height: 1.6; color: #333;">
          If you did not request this, please ignore this email or contact our WanderLust support team immediately.
        </p>
      </div>
      <div style="text-align: center; margin-top: 20px; font-size: 14px; color: #999;">
        <p>&copy; ${new Date().getFullYear()} WanderLust. All rights reserved.</p>
        <p>
          Need help? Contact us at 
          <a href="mailto:support@wanderlust.com" style="color: #4CAF50; text-decoration: none;">support@wanderlust.com</a>
        </p>
        <p>Visit us at <a href="https://wanderlust-alp9.onrender.com/" style="color: #4CAF50; text-decoration: none;">www.wanderlust.com</a></p>
      </div>
    </div>
    `
    };

    transporter.sendMail(mailOptions);
};

module.exports = {sendOtpEmail}
