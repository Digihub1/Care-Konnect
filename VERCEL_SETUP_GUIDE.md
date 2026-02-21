# 🚀 Vercel Deployment - Fix 500 Error

Your application crashed because **DATABASE_URL is not set** in Vercel environment variables.

## ✅ Quick Fix (5 minutes)

### Step 1: Create Neon Database (if not already done)
1. Go to [console.neon.tech](https://console.neon.tech)
2. Sign up/Login and create a new PostgreSQL project
3. Copy your connection string (looks like: `postgresql://user:password@...`)

### Step 2: Set Environment Variables on Vercel

1. Go to your Vercel Dashboard: https://vercel.com/dashboard
2. Click on your **care-konnect** project
3. Go to **Settings** → **Environment Variables**
4. Add these variables:

**For Production (Essential):**
```
DATABASE_URL = postgresql://user:password@region.neon.tech/dbname
NODE_ENV = production
SESSION_SECRET = (copy from .env.production file)
```

**For Email (Optional but recommended):**
```
SMTP_HOST = smtp.gmail.com
SMTP_PORT = 587
SMTP_USER = your-email@gmail.com
SMTP_PASS = your-app-password
EMAIL_FROM = your-email@gmail.com
```

**For Payments (Optional):**
```
MPESA_CONSUMER_KEY = your-key
MPESA_CONSUMER_SECRET = your-secret
MPESA_SHORTCODE = your-code
MPESA_PASSKEY = your-passkey
```

### Step 3: Redeploy

```bash
# Using Vercel CLI
vercel --prod

# Or trigger redeploy from Vercel Dashboard:
# - Go to Deployments tab
# - Click "Redeploy" on the latest failed deployment
```

## 🔍 How to Find Your Environment Variables

### DATABASE_URL
- **Neon Dashboard** → Your Project → Connection String → Copy the PostgreSQL URL

### SESSION_SECRET & JWT_SECRET
- Check your local `.env.production` file
- Or generate new ones: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

### SMTP Password (Gmail)
1. Enable 2-Factor Authentication on your Google Account
2. Go to Google Account → Security
3. Create an "App Password" for Gmail
4. Use that password as SMTP_PASS (NOT your regular password!)

## 🧪 Test Your Setup

After redeploying, check these URLs:

- **Health Check**: https://care-konnect.vercel.app/health
- **Setup Status**: https://care-konnect.vercel.app/setup
- **Home Page**: https://care-konnect.vercel.app/

You should see:
```json
{
  "status": "ok",
  "environment": "production",
  "timestamp": "2026-02-21T..."
}
```

## 📋 Troubleshooting

### Still seeing 500 error?
1. Check Vercel **Function Logs** for error messages
   - Dashboard → Deployment → Functions (top-right)
   - Look for errors in the logs
2. Verify DATABASE_URL is exactly as provided by Neon
3. Ensure all required variables are set (at least DATABASE_URL)

### Database connection works but features fail?
- Check that Neon tables exist
  - If missing, manually run: `npm run syncdb` locally with Neon URL
- Verify other credentials (SMTP, M-Pesa) are correct

### App loads but no styling?
- Static files are being served correctly
- This is usually not a database issue

## 📞 Support Links

- **Vercel Environment Variables**: https://vercel.com/docs/projects/environment-variables
- **Neon Documentation**: https://neon.tech/docs/connect/connect-from-any-app
- **Express/Node.js Guide**: https://expressjs.com/

---

✅ Once you've completed these steps, your app should be **live and working** on Vercel!
