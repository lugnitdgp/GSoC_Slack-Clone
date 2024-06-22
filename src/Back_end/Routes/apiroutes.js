const express = require('express');
const router = express.Router();
const { sendUserEmail } = require("../utils/sendUsermail");

router.post('/sendUserEmail', async (req, res) => {
  try {
    const { to,subject, message } = req.body;
    await sendUserEmail(to,subject, message); // Call your backend function to send email

    res.status(200).send('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).send('Failed to send email');
  }
});

module.exports = router;
