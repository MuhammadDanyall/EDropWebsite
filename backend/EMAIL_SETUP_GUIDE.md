# Email Configuration Guide for Production

## Problem: OTP Not Sending on Vercel/Railway

Aapka OTP local server par theek aa raha hai lekin Vercel/Railway par nahi aa raha. Ye Gmail ki wajah se hota hai kyunki Gmail ne production environments mein Gmail ke liye additional security measures hote hain.

## Solutions

### Solution 1: Use Gmail App Password (Recommended)

1. Gmail account mein 2-Step Verification enable karein:
   - Gmail → Manage your Google Account → Security → 2-Step Verification

2. Phir App Password create karein:
   - Security → App Passwords
   - App: Mail
   - Device: Other (Custom Name: Railway/Vercel)
   - Generate → Copy the generated password
   - Is password ko `.env` file mein `EMAIL_PASS` ke jagah use karein

3. Ye App Password Gmail ke bajaye use karein!

### Solution 2: Use a Transactional Email Service (Better for Production)

Gmail ke bajaye ye services ka use karein jo production ke liye better hain:
- SendGrid
- Mailgun
- Brevo (Sendinblue)
- Postmark

### Solution 3: Check Environment Variables

Vercel/Railway par ye environment variables set hain?

**Vercel:**
- Project Settings → Environment Variables
- `MONGO_URI`, `EMAIL_USER`, `EMAIL_PASS`, `GEMINI_API_KEY` add karein

**Railway:**
- Variables tab par variables add karein

## Important Notes

1. Gmail ka use production ke liye recommended nahi hai kyunki:
   - Rate limits hote hain
   - Security restrictions hote hain
   - Reliability issues ho sakti hai

2. Production ke liye hamesha proper transactional email service use karein.

## Quick Test Steps for Testing

Local mein test karne ke liye:
1. Server start karein aur console check karein
2. "✅ Email transporter is ready to send emails" message aana chahiye
3. Agar error aaye, error message dikhaya jayega
