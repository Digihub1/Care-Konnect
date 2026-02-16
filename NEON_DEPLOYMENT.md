# Neon Deployment Guide for Care Konnect

This guide explains how to deploy Care Konnect on Neon PostgreSQL hosting.

## 📋 Prerequisites

- Neon account (create at https://console.neon.tech)
- Node.js 16+ installed locally
- Git repository configured
- Hosting platform (Vercel, Railway, Heroku, or similar)

## 🚀 Deployment Steps

### Step 1: Create a Neon Project

1. Sign in to [Neon Console](https://console.neon.tech)
2. Click "Create a project"
3. Choose a project name (e.g., "care-konnect")
4. Select region closest to your users (e.g., Europe or US)
5. Choose PostgreSQL version 15 or higher
6. Click "Create project"

### Step 2: Get Your Neon Connection String

1. In Neon Console, go to your project
2. Click "Connection string" tab
3. Copy the "Connection string" (starts with `postgresql://`)
4. Keep this secure - it contains your password

### Step 3: Configure Environment Variables

Create a `.env.production` file with your Neon connection string:

```env
# Neon PostgreSQL Configuration
DATABASE_URL=postgresql://user:password@region.neon.tech/dbname

# Server Configuration
PORT=3000
NODE_ENV=production

# Session Secret (generate a random 32+ character string)
SESSION_SECRET=your_random_32_character_string_here

# Security Secrets (generate random strings)
JWT_SECRET=your_random_64_character_string_here
ENCRYPTION_KEY=your_random_32_character_string_here

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@tunzacare.co.ke

# Payment Configuration
MPESA_CONSUMER_KEY=your-key
MPESA_CONSUMER_SECRET=your-secret
MPESA_SHORTCODE=your-shortcode
MPESA_PASSKEY=your-passkey
```

### Step 4: Update Database Connection Code

The application already supports `DATABASE_URL` environment variable. Verify in [models/database.js](models/database.js) that it uses:

```javascript
const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    // ... other config
});
```

If needed, update to parse the connection string properly.

### Step 5: Database Migration

Before deployment:

1. **Backup your current database** (if migrating from existing setup)
2. **Run migrations on Neon database**:
   ```bash
   # Connect to Neon database
   DATABASE_URL="your_neon_connection_string" npm run migrate
   ```

3. **Verify schema**:
   ```sql
   -- Connect to Neon and verify tables exist
   SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
   ```

### Step 6: Deploy to Hosting Platform

#### Option A: Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard
# Go to Settings > Environment Variables and add DATABASE_URL and others
```

#### Option B: Railway

1. Push code to GitHub
2. Go to railway.app
3. Click "Deploy Now"
4. Select your GitHub repo
5. Add environment variables in Railway dashboard
6. Click "Deploy"

#### Option C: Heroku

```bash
# Install Heroku CLI
# Create heroku app
heroku create your-app-name

# Set environment variables
heroku config:set DATABASE_URL="your_neon_connection_string"
heroku config:set SESSION_SECRET="your_secret"
heroku config:set NODE_ENV="production"

# Deploy
git push heroku main
```

### Step 7: Verify Deployment

1. Check application logs in hosting platform
2. Visit your deployed URL
3. Test database connectivity by logging in
4. Check admin dashboard to confirm database queries work

## 🔧 Important Configuration Notes

### Connection Pooling

Neon has connection limits. The application already includes pooling:

```javascript
pool: {
    max: 20,
    min: 0,
    acquire: 60000,
    idle: 10000
}
```

For Neon's free tier, consider reducing `max: 10` in production.

### SSL/TLS

Neon requires SSL connections. Ensure this is set in production:

```javascript
{
    dialect: 'postgres',
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    }
}
```

### Environment Variables Required

- ✅ `DATABASE_URL` - Neon PostgreSQL connection string
- ✅ `NODE_ENV` - Set to "production"
- ✅ `SESSION_SECRET` - Random 32+ char string
- ✅ `JWT_SECRET` - Random 64+ char string
- ✅ `PORT` - Usually 3000 (hosting platform sets this)
- ✅ Other config (Email, M-Pesa, etc.)

## 🐛 Troubleshooting

### Connection Timeout
- Check if hosting platform can reach Neon region
- Verify firewall rules allow PostgreSQL (port 5432)
- Check connection pool settings

### SSL Certificate Error
- Ensure `ssl.rejectUnauthorized: false` in production
- Neon requires SSL connections

### Missing Tables
- Run database initialization script
- Check if migrations executed successfully
- Verify `DATABASE_URL` is correct

### Payment/Email Not Working
- Verify SMTP credentials are correct
- Check M-Pesa credentials are accurate
- Test locally before deploying

## 📚 Resources

- [Neon Documentation](https://neon.tech/docs/introduction)
- [Sequelize PostgreSQL Guide](https://sequelize.org/docs/v6/databases/postgres/)
- [Railway Deployment Guide](https://docs.railway.app)
- [Vercel Deployment Guide](https://vercel.com/docs)

## 💡 Best Practices

1. **Always backup production data** before major changes
2. **Test in staging environment** before production deployment
3. **Use connection pooling** for better performance
4. **Monitor database usage** in Neon console
5. **Keep Node.js dependencies updated**
6. **Use environment-specific configuration** (.env.production vs .env.development)
7. **Enable Neon's automated backups** in project settings
8. **Use strong, random secrets** for all keys

---

**Next Steps:** Set up your Neon project and configure environment variables, then deploy!
