# Email Configuration Guide for Production

## Problem: OTP Not Sending on Vercel/Railway

Aapka OTP local server par theek aa raha hai lekin Vercel/Railway par nahi aa raha. Ye Gmail ki wajah se hota hai kyunki Gmail ne production environments mein Gmail ke liye additional security measures hote hain.

## Solutions

### Solution 0: FIRST - Check Server Logs! (Quick Fix)
**IMPORTANT:** Ab humne code mein OTP ko hamesha server logs mein log karne ka feature add kiya hai!
- Agar Vercel/Railway par OTP email nahi aa raha, toh bas server logs check karein
- Vercel: Deployment → Functions → Logs
- Railway: Deployment → Logs
- Waha par aapko clearly dikhega: `🔐 ADMIN LOGIN OTP GENERATED: 123456`
- Us OTP ko directly use kar sakte hain, email ke bina bhi login ho jayega!

### Solution 1: Use Gmail App Password (Recommended)

1. Gmail account mein 2-Step Verification enable karein:
   - Gmail → Manage your Google Account → Security → 2-Step Verification

2. Phir App Password create karein:
   - Security → App Passwords
   - App: Mail
   - Device: Other (Custom Name: Railway/Vercel)
   - Generate → Copy the generated password (16-digit code, no spaces)
   - Is password ko .env file mein EMAIL_PASS ke jagah use karein

3. Ye App Password Gmail ke bajaye use karein!

### Solution 2: Use a Transactional Email Service (Better for Production)

Gmail ke bajaye ye services ka use karein jo production ke liye better hain:
- SendGrid
- Mailgun
- Brevo (Sendinblue) - Free tier available
- Postmark

### Solution 3: Check Environment Variables on Vercel/Railway

Vercel/Railway par ye environment variables set hain?

**Vercel:**
1. Go to your Project Dashboard
2. Settings → Environment Variables
3. Add these variables (make sure "Automatically expose System Environment Variables" is OFF):
   - MONGO_URI
   - EMAIL_USER (your gmail address)
   - EMAIL_PASS (your Gmail App Password, NOT normal password)
   - GEMINI_API_KEY
4. Redeploy after adding variables!

**Railway:**
1. Go to your Project
2. Variables tab
3. Add these variables:
   - MONGO_URI
   - EMAIL_USER
   - EMAIL_PASS (App Password)
   - GEMINI_API_KEY
4. Redeploy the service!

## Important Notes

1. Gmail ka use production ke liye recommended nahi hai kyunki:
   - Rate limits hote hain
   - Security restrictions hote hain
   - Reliability issues ho sakta hai

2. Production ke liye hamesha proper transactional email service use karein.

## Quick Test Steps for Testing

Local mein test karne ke liye:
1. Server start karein aur console check karein
2. "✅ Email transporter is ready to send emails" message aana chahiye
3. Login try karein, console mein aapko OTP clearly dikhega: `🔐 ADMIN LOGIN OTP GENERATED: 123456`
4. Agar email fail bhi ho jaye, tab bhi OTP logs mein milega!
