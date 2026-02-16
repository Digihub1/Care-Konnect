# Neon Deployment Checklist

Use this checklist to ensure your Care Konnect application is ready for production deployment on Neon.

## ✅ Pre-Deployment Tasks

### 1. Database Setup
- [ ] Create a Neon project at https://console.neon.tech
- [ ] Copy your Neon connection string
- [ ] Test connection locally: `DATABASE_URL="..." npm run dev`
- [ ] Verify all tables are created correctly
- [ ] Check data integrity and backup current data

### 2. Environment Variables
- [ ] Generate secure SESSION_SECRET (32+ characters)
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- [ ] Generate secure JWT_SECRET (64+ characters)
  ```bash
  node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
  ```
- [ ] Generate secure ENCRYPTION_KEY (32+ characters)
- [ ] Configure email credentials (SMTP)
- [ ] Configure M-Pesa payment credentials
- [ ] Update `.env.production` with all values
- [ ] **Do NOT commit `.env.production` to GitHub**

### 3. Code Quality
- [ ] Run tests: `npm test` (if tests exist)
- [ ] Check for console.log statements that should be removed
- [ ] Verify error handling works properly
- [ ] Test all critical user flows (login, payment, admin functions)
- [ ] Verify CORS configuration is correct
- [ ] Check helmet security headers are properly set

### 4. Database Performance
- [ ] Review [NEON_DEPLOYMENT.md](NEON_DEPLOYMENT.md) connection pooling settings
- [ ] Verify indexes are created on foreign keys and frequently queried columns
- [ ] Test with expected production data volume
- [ ] Monitor slow queries in development: `NODE_ENV=development`

### 5. Dependencies
- [ ] Run `npm audit` and fix any vulnerabilities
  ```bash
  npm audit fix
  ```
- [ ] Ensure `pg` and `sequelize` are latest compatible versions
- [ ] Test all critical features with updated packages

### 6. Deployment Platform Setup
Choose your deployment platform and complete:

#### If deploying to **Vercel**:
- [ ] Connect GitHub repository to Vercel
- [ ] Set environment variables in Vercel dashboard
- [ ] Configure build command: `npm install`
- [ ] Configure start command: `npm start`
- [ ] Enable automatic deployments on push

#### If deploying to **Railway**:
- [ ] Push code to GitHub
- [ ] Link GitHub repo to Railway
- [ ] Add environment variables
- [ ] Ensure `npm start` command works
- [ ] Configure custom domain (optional)

#### If deploying to **Heroku**:
- [ ] Create Procfile:
  ```
  web: node server.js
  ```
- [ ] Set buildpacks: `heroku/nodejs`
- [ ] Set environment variables via CLI or dashboard
- [ ] Deploy via `git push heroku main`

### 7. Security Review
- [ ] Verify NODE_ENV is set to "production"
- [ ] Confirm no hardcoded secrets in code
- [ ] Check that sensitive routes require authentication
- [ ] Verify rate limiting is enabled
- [ ] Ensure CORS only allows your domain
- [ ] Check helmet security headers in [server.js](server.js)
- [ ] Verify session secret is different in production
- [ ] Confirm SSL/TLS is enabled (Neon requires it)

### 8. Logging & Monitoring
- [ ] Verify logging is configured for production
- [ ] Set appropriate log levels (not DEBUG in production)
- [ ] Check error tracking is enabled (if using service)
- [ ] Monitor database connections on Neon dashboard
- [ ] Set up alerts for critical errors

### 9. DNS & Domain
- [ ] Purchase domain (if not already done)
- [ ] Configure DNS records pointing to hosting platform
- [ ] Wait for DNS propagation (24-48 hours)
- [ ] Set up SSL certificate (usually automatic)
- [ ] Test HTTPS access to your domain

### 10. Final Testing in Production
- [ ] [ ] Access your live application via domain
- [ ] [ ] Test user registration and login
- [ ] [ ] Verify email notifications are sent
- [ ] [ ] Test payment flow (use test mode if available)
- [ ] [ ] Check admin dashboard functionality
- [ ] [ ] Verify all images and assets load correctly
- [ ] [ ] Test on mobile devices
- [ ] [ ] Check performance in different regions
- [ ] [ ] Test error pages (404, 500, etc.)

## 🚨 Critical Issues to Resolve Before Deployment

- [ ] All tests pass
- [ ] No `console.log()` debugging statements in production code
- [ ] Environment variables properly configured
- [ ] Database migrations have run successfully
- [ ] SSL/TLS certificate is valid
- [ ] Payment processing tested (use sandbox/test mode)
- [ ] Email sending tested
- [ ] No database connection errors in logs
- [ ] All secrets are kept out of version control

## 📊 Post-Deployment Monitoring

After deployment:
1. **Monitor logs** for any errors
2. **Check database health** in Neon dashboard
3. **Monitor application performance** (response times, error rates)
4. **Watch for unusual traffic patterns**
5. **Test critical features daily** for first week
6. **Set up automated backups** if not already configured
7. **Plan regular security updates**

## 🔄 Deployment Commands

```bash
# Local testing with Neon connection
DATABASE_URL="postgresql://user:password@host/db" npm run dev

# Build check
npm install
npm run dev

# View logs (platform-specific)
# Vercel: vercel logs
# Railway: railway logs
# Heroku: heroku logs --tail

# Rollback if needed
# Vercel: Revert to previous deployment
# Railway: Redeploy previous commit
# Heroku: heroku releases:rollback
```

## 📞 Support Resources

- **Neon Support**: https://neon.tech/docs
- **Sequelize Docs**: https://sequelize.org/docs/v6/
- **Node.js Best Practices**: https://nodejs.org/en/docs/guides/nodejs-web-app-security/
- **Your Deployment Platform Docs**: See links in step 6 above

---

**Status**: Ready for review before deployment ✓
