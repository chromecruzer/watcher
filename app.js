const express = require("express");
const nodemailer = require("nodemailer");
require("dotenv").config(); // Import dotenv to load .env file

const app = express();
const port = 3000 || process.env.PORT;

app.use(express.json()); // To parse JSON bodies

// Setup the NodeMailer transporter using environment variables
const transporter = nodemailer.createTransport({
    service: "gmail", // or any other email service
    auth: {
        user: process.env.EMAIL_USER, // Use the email from .env
        pass: process.env.EMAIL_PASS, // Use the email password from .env
    },
});

// Flag to track if the email has already been sent during the current session
let emailSentFlag = false;

// Endpoint to send the email
app.post("/send-email", (req, res) => {
    // If the email has already been sent for this session, do nothing
    if (emailSentFlag) {
        return res.status(200).json({
            message: "Email already sent in this session. No action taken.",
        });
    }

    // If email hasn't been sent yet, proceed to send it
    const { subject, text } = req.body;

    const mailOptions = {
        from: process.env.EMAIL_USER, // Sender's email (from .env)
        to: process.env.RECIPIENT_EMAIL, // Recipient email (from .env)
        subject: subject,
        text: text,
    };

    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return res.status(500).json({
                error: "Error sending email",
                message: error.message,
            });
        }

        // Mark email as sent for this session
        emailSentFlag = true;
        return res.status(200).json({
            message: "Email sent successfully",
            info: info.response,
        });
    });
});

// Reset the flag after a system restart or periodic time (optional)
app.post("/reset-email-flag", (req, res) => {
    emailSentFlag = false; // Reset the flag manually if needed
    res.status(200).json({ message: "Email sent flag reset" });
});

// Listen to requests on the specified port
app.listen(port, () => {
    console.log(`NodeMailer endpoint is running on http://localhost:${port}`);
});
