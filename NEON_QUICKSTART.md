# Quick Start: Deploy Care Konnect on Neon in 5 Steps

Get your Care Konnect application live on Neon PostgreSQL in minutes!

## Step 1: Create Neon Project (2 minutes)

1. Go to [console.neon.tech](https://console.neon.tech)
2. Sign up or log in
3. Click **"Create a project"**
4. Name it: `care-konnect`
5. Select PostgreSQL 15
6. Click **"Create project"**

## Step 2: Get Your Connection String (1 minute)

1. In Neon dashboard, find your project
2. Go to the **Connection string** tab
3. Copy the full connection string (should start with `postgresql://`)
4. Example: `postgresql://neondb_owner:AbCdEfGhIjKlMnOp@ep-cool-penguin-123456.us-east-1.neon.tech/neondb`

## Step 3: Set Up Environment Variables (2 minutes)

Create a `.env.production` file in your project root:

```env
DATABASE_URL=postgresql://user:password@region.neon.tech/dbname

PORT=3000
NODE_ENV=production

SESSION_SECRET=your_random_32_character_string_here_use_node_to_generate
JWT_SECRET=your_random_64_character_string_here_use_node_to_generate
ENCRYPTION_KEY=your_random_32_character_string_here

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@care-konnect.co.ke

MPESA_CONSUMER_KEY=your-key
MPESA_CONSUMER_SECRET=your-secret
MPESA_SHORTCODE=your-shortcode
MPESA_PASSKEY=your-passkey
```

To generate random strings:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"  # 32-char
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"  # 64-char
```

## Step 4: Test Locally (2 minutes)

```bash
# Install dependencies
npm install

# Test with Neon connection
DATABASE_URL="your_connection_string_here" npm run dev

# Visit http://localhost:3000
```

✅ If it works, you're ready to deploy!

## Step 5: Deploy to Hosting (Choose One)

### Option A: Deploy to Vercel (Recommended - Easiest)

```bash
# Install Vercel CLI
npm install -g vercel

# Initialize Project (Log in and set up)
vercel

# Deploy
vercel --prod
```

Then set environment variables in Vercel dashboard:
- Go to Project Settings → Environment Variables
- Add `DATABASE_URL`, `SESSION_SECRET`, `JWT_SECRET`, `ENCRYPTION_KEY`, etc.
- Redeploy

### Option B: Deploy to Railway

1. Push your code to GitHub
2. Go to [railway.app](https://railway.app)
3. Click **"New Project"** → **"Deploy from GitHub"**
4. Select your repository
5. Add environment variables in Railway dashboard
6. Deploy!

### Option C: Deploy to Heroku

```bash
# Create Procfile (already exists in your project)
# Procfile content: web: node server.js

# Install Heroku CLI
npm install -g heroku

# Login to Heroku
heroku login

# Create app
heroku create your-app-name

# Set environment variables
heroku config:set DATABASE_URL="your_connection_string"
heroku config:set SESSION_SECRET="your_secret"
heroku config:set JWT_SECRET="your_jwt_secret"
heroku config:set ENCRYPTION_KEY="your_encryption_key"

# Deploy
git push heroku main
```

## ✅ Verify Deployment

After deployment:

1. Visit your live URL
2. Create a test account
3. Log in
4. Check that database queries work
5. Verify email notifications send
6. Test payment flow (if applicable)

## 🆘 Troubleshooting

### "Connection refused" error
- Check DATABASE_URL is correct
- Verify Neon connection string hasn't expired
- Check firewall allows your hosting region

### "SSL: CERTIFICATE_VERIFY_FAILED"
- Update your `.env.production` - it's already configured in the code

### "Timeout" errors
- Check connection pool settings in [models/database.js](models/database.js)
- Reduce `max: 10` if using Neon free tier

### Database tables not created
- Run: `DATABASE_URL="your_string" npm run dev`
- Check console for table creation messages
- Verify with Neon SQL Editor

## 📚 Full Documentation

For detailed information, see:
- [NEON_DEPLOYMENT.md](NEON_DEPLOYMENT.md) - Complete deployment guide
- [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) - Pre-deployment checklist
- [Neon Docs](https://neon.tech/docs)

---

**You're all set!** Your Care Konnect app is now running on Neon PostgreSQL. 🎉
