# Email Configuration Guide for Production

## Problem: OTP Not Sending on Vercel/Railway

Aapka OTP local server par theek aa raha hai lekin Vercel/Railway par nahi aa raha. Ye Gmail ki wajah se hota hai kyunki Gmail ne production environments mein Gmail ke liye additional security measures hote hain.

## Best Solution: Use Brevo (Sendinblue) - 100% Working!

Gmail ki jagah Brevo use karein - ye free hai, production-ready hai, aur Vercel/Railway par bilkul smoothly kaam karta hai!

### Step 1: Brevo Account Create Karein
1. https://brevo.com/ par jaiye
2. Free account create karein (300 emails/day free)
3. Email verify karein

### Step 2: Brevo SMTP Credentials Get Karein
1. Brevo Dashboard par jaiye
2. Top right corner mein apne profile par click karein → **SMTP & API**
3. **SMTP** tab par jaiye
4. Aapko yaha milenge:
   - **Login**: (apni Brevo email)
   - **Master Password**: yaha se generate karein ya copy karein
5. Ye dono values save karein!

### Step 3: Environment Variables Set Karein

**Local (.env file):**
```env
BREVO_USER=your-brevo-email@example.com
BREVO_PASS=your-brevo-master-password
```

**Vercel:**
1. Project → Settings → Environment Variables
2. Add these:
   - `BREVO_USER`: your-brevo-email@example.com
   - `BREVO_PASS`: your-brevo-master-password
   - (Baaki variables MONGO_URI, GEMINI_API_KEY already set rakhiye)
3. Redeploy karein!

**Railway:**
1. Project → Variables
2. Add these variables:
   - `BREVO_USER`: your-brevo-email@example.com
   - `BREVO_PASS`: your-brevo-master-password
3. Redeploy karein!

### Step 4: Enjoy!

Ab har baar OTP aapke email par aayega! Bilkul smooth!

---

## Backup Solution: Check Server Logs

Agar kabhi email nahi aaye, toh hamesha server logs check karein. OTP waha hamesha dikhega:
```
🔐 ADMIN LOGIN OTP GENERATED: 123456
```

---

## Important Notes

1. **Gmail production ke liye mat use karein** - Vercel/Railway par properly kaam nahi karta
2. **Brevo use karein** - free, reliable, production-ready
3. **Logs hamesha backup ke liye check kar sakte hain**

---

## Quick Test Steps for Testing

Local mein test karne ke liye:
1. Server start karein aur console check karein
2. "✅ Email transporter is ready to send emails" message aana chahiye
3. Login try karein, console mein aapko OTP clearly dikhega: `🔐 ADMIN LOGIN OTP GENERATED: 123456`
4. Email par bhi OTP aana chahiye!
