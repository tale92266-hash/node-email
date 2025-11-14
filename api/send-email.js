// Vercel Serverless Function: /api/send-email.js
const nodemailer = require('nodemailer');

// 1. Naye ENV variables
// NOTE: Vercel mein GMAIL_APP_PASSWORD set karna hoga
const GMAIL_USER = process.env.EMAIL_USER;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD; // Yeh naya password hai
const VERCEL_EMAIL_API_KEY = process.env.VERCEL_EMAIL_API_KEY;

// 2. createTransporter (Simple version)
async function createTransporter() {
    if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
        throw new Error("Email service is not fully configured (Missing EMAIL_USER or GMAIL_APP_PASSWORD).");
    }
    
    // Yahaan googleapis ki zaroorat nahi hai
    return nodemailer.createTransport({
        service: 'gmail', 
        auth: {
            user: GMAIL_USER, // Aapka Gmail address
            pass: GMAIL_APP_PASSWORD, // Aapka 16-digit waala App Password
        },
    });
}

// Vercel Function Handler
module.exports = async (req, res) => {
    // 3. Security Check (Same as before)
    const authHeader = req.headers['authorization'];
    if (!authHeader || authHeader !== `Bearer ${VERCEL_EMAIL_API_KEY}`) {
        return res.status(401).json({ success: false, message: 'Unauthorized access to email API.' });
    }

    // 4. Input Validation (Same as before)
    const { to, subject, html, text } = req.body;
    if (!to || !subject || !html) {
        return res.status(400).json({ success: false, message: 'Missing required email fields (to, subject, html).' });
    }

    try {
        // createTransporter ab OAuth nahi use karta
        const transporter = await createTransporter();
        
        const mailOptions = { 
            from: `"👉𝘕𝘖𝘉𝘐 𝘉𝘖𝘛🤟" <${GMAIL_USER}>`,
            to, 
            subject, 
            html, 
            text: text || ''
        };

        let info = await transporter.sendMail(mailOptions);
        
        return res.status(200).json({ 
            success: true, 
            message: 'Email sent successfully via Vercel API (App Password).',
            messageId: info.messageId
        });

    } catch (error) {
        console.error('❌ Vercel Function Email Send Error (App Pass):', error);
        return res.status(500).json({ 
            success: false, 
            message: `Failed to send email: ${error.message}`
        });
    }
};
