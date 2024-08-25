const nodemailer = require("nodemailer");
require("dotenv").config();

const mail = process.env.EMAIL_USER;
const password = process.env.EMAIL_PASS;

async function sendUserEmail(to, subject, text) {
  try {
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: mail,
        pass: password,
      },
    });

    let info = await transporter.sendMail({
      from: mail,
      to: to,
      subject: subject,
      text: text,
    });

    console.log("Message sent: %s", info.messageId);
  } catch (error) {
    console.error("Error sending email:", error);
    throw error; 
  }
}
module.exports = { sendUserEmail };
