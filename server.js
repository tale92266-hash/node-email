// server.js (App Password Version)
const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');
const path = require('path');

dotenv.config();
const app = express();

// --- Zaroori Middleware ---
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public'))); // 'public' folder ko serve karega

// --- Environment Variables (App Password) ---
// Note: ENV mein GOOGLE_CLIENT_ID/SECRET/REFRESH_TOKEN ki zaroorat nahi hai
const GMAIL_USER = process.env.EMAIL_USER;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD; // Yeh naya password hai
const PORT = process.env.PORT || 5000;

// -----------------------------------------------------------------------
// 💡 APP PASSWORD EMAIL SERVICE LOGIC
// -----------------------------------------------------------------------

// Transporter Creator
async function createTransporter() {
    if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
        throw new Error("Email service is not configured (Missing EMAIL_USER or GMAIL_APP_PASSWORD).");
    }
    
    return nodemailer.createTransport({
        service: 'gmail', 
        auth: {
            user: GMAIL_USER, // Aapka Gmail
            pass: GMAIL_APP_PASSWORD, // Aapka 16-digit App Password
        },
    });
}

// Send Email Function
async function sendTestEmail(targetEmail) {
    const transporter = await createTransporter();
    const randomString = Math.random().toString(36).substring(2, 10);

    const mailOptions = { 
        from: `"Nobita Test Bot" <${GMAIL_USER}>`, 
        to: targetEmail, 
        subject: `🚀 App Password Test - Code: ${randomString}`, 
        html: `
            <h2>Hello,</h2>
            <p>This email was sent using the <strong>App Password method</strong>.</p>
            <p><strong>Test Code:</strong> ${randomString}</p>
        `,
        text: `Test Email. Code: ${randomString}`,
    };

    let info = await transporter.sendMail(mailOptions);
    console.log('✅ Test Email sent (App Pass)! ID: %s', info.messageId);
    return { success: true, messageId: info.messageId };
}

// -----------------------------------------------------------------------
// 🌐 API ROUTE (Frontend se call karne ke liye)
// -----------------------------------------------------------------------
app.post('/api/send-email', async (req, res) => {
    try {
        // Frontend se 'email' field le rahe hain
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: 'Email address is required.' });
        }
        
        const mailResult = await sendTestEmail(email);

        return res.status(200).json({ 
            success: true, 
            message: `Test email sent successfully to ${email}!`,
            messageId: mailResult.messageId
        });

    } catch (error) {
        console.error('❌ API Error during email send:', error.message);
        return res.status(500).json({ 
            success: false, 
            message: `Email sending failed: ${error.message}`
        });
    }
});

// -----------------------------------------------------------------------
// 🚀 SERVER START
// -----------------------------------------------------------------------
app.listen(PORT, () => {
    if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
        console.error("⚠️ CRITICAL: EMAIL_USER ya GMAIL_APP_PASSWORD missing hai.");
    }
    console.log(`🚀 Email Test Server running on http://localhost:${PORT}`);
});
