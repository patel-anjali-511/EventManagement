const nodemailer = require("nodemailer");

const sendEmail = async ({ to, subject, html, attachments }) => {
  try {
    const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.NODEMAILER_EMAIL,
    pass: process.env.NODEMAILER_PASS,
  },
});
    const mailOptions = {
      from: process.env.NODEMAILER_EMAIL || '"EventNest" <noreply@eventnest.com>',
      to,
      subject,
      html,
      attachments,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    // Suppress error to avoid breaking the main registration flow if email fails
    // In production, you might want to retry or handle it differently
  }
};

module.exports = sendEmail;
