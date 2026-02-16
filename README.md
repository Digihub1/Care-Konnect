# TunzaCare - Kenyan Caregiving Portal

A comprehensive web platform connecting verified caregivers with families in need across Kenya.

## 🌍 Overview

TunzaCare is a modern caregiving platform built with Node.js and Express that enables:
- **Clients** to browse and hire qualified caregivers
- **Caregivers** to build professional profiles and secure employment
- **Admins** to manage the platform, verify caregivers, and monitor metrics

## 🚀 Features

- ✅ User authentication (Clients, Caregivers, Admins)
- ✅ Caregiver verification system
- ✅ Rating and review system
- ✅ Subscription management
- ✅ M-Pesa payment integration
- ✅ Comprehensive admin dashboard with analytics
- ✅ Search and filter caregivers by specialization, location, rating
- ✅ Security features (rate limiting, input sanitization, XSS protection)
- ✅ Responsive design with Kenyan-themed colors

## 📋 Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL with Sequelize ORM
- **Frontend:** EJS templates, HTML5, CSS3, Vanilla JavaScript
- **Authentication:** Session-based with bcryptjs
- **Security:** Helmet, express-rate-limit, express-mongo-sanitize, xss-clean
- **Payment:** M-Pesa integration (Safaricom)

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Care\ Konnect
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   # Copy the example .env file
   cp .env.example .env
   
   # Edit .env with your configuration
   nano .env
   ```

4. **Initialize PostgreSQL database**
   ```bash
   # Create database
   createdb tunzacare_db
   
   # Create user (if using custom credentials)
   createuser -P tunza_user  # and set password
   ```

5. **Start the application**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

6. **Access the application**
   ```
   http://localhost:3000
   ```

## 🔧 Environment Configuration

Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=your_secure_password
DB_NAME=tunzacare_db
DB_PORT=5432

# Server Configuration
PORT=3000
NODE_ENV=production
CORS_ORIGIN=https://yourdomain.com

# Session Configuration
SESSION_SECRET=generate_random_32_char_string

# Security
JWT_SECRET=generate_random_64_char_string
ENCRYPTION_KEY=generate_random_32_char_string

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@tunzacare.co.ke

# Payment Configuration (M-Pesa)
MPESA_CONSUMER_KEY=your-key
MPESA_CONSUMER_SECRET=your-secret
MPESA_SHORTCODE=your-code
MPESA_PASSKEY=your-passkey

# Application
APP_NAME=TunzaCare
APP_URL=https://yourdomain.com
LOG_LEVEL=info
```

## 📁 Project Structure

```
Care Konnect/
├── views/                 # EJS templates
│   ├── auth/             # Login/Register pages
│   ├── client/           # Client dashboard
│   ├── caregiver/        # Caregiver dashboard
│   ├── admin/            # Admin panel
│   └── partials/         # Header, footer components
├── routes/               # Express route handlers
│   ├── auth.js          # Authentication routes
│   ├── client.js        # Client routes
│   ├── caregiver.js     # Caregiver routes
│   └── admin.js         # Admin routes
├── models/              # Sequelize database models
│   └── database.js      # All database schemas
├── middleware/          # Custom middleware
│   └── middleware.js    # Auth & validation
├── public/              # Static assets
│   ├── css/
│   ├── js/
│   └── images/
├── script/              # Utility scripts
│   └── optimize-postgres.js
├── server.js            # Express app initialization
├── package.json         # Dependencies
├── .env                 # Environment variables
└── README.md           # This file
```

## 🔐 Security Features

- **Helmet.js** - Sets HTTP security headers
- **Rate Limiting** - Prevents brute force attacks
- **Input Sanitization** - XSS and injection protection
- **HTTPS/Secure Cookies** - In production
- **Password Strength Validation** - 8+ chars, uppercase, lowercase, number, special char
- **bcryptjs** - Password hashing with 12 salt rounds
- **Session Security** - HTTPOnly, SameSite cookies

## 📊 Database Models

### User
- Base model for all users
- Fields: id, firstName, lastName, email, phone, idNumber, password, userType, profilePicture, isVerified, isActive

### CaregiverProfile
- Extended caregiver information
- Fields: bio, experienceYears, specialization, certifications, languages, hourlyRate, availability, location, county, rating, totalReviews, verificationStatus, subscriptionStatus

### ClientProfile
- Client preferences and information
- Fields: preferredLocation, careTypeNeeded, budgetRange

### Review
- Ratings and comments from clients
- Fields: rating (1-5), comment, isVerified

### Subscription
- Caregiver subscription plans
- Plans: monthly (KES 500), quarterly (KES 1400), yearly (KES 5000)

### Payment
- Payment transaction records
- Supports M-Pesa, card, bank transfers

## 🚀 Deployment

### Heroku Deployment

1. **Install Heroku CLI**
   ```bash
   npm install -g heroku
   ```

2. **Login to Heroku**
   ```bash
   heroku login
   ```

3. **Create Heroku app**
   ```bash
   heroku create tunzacare
   ```

4. **Set environment variables**
   ```bash
   heroku config:set DB_HOST=your-db-host
   heroku config:set DB_USER=your-db-user
   # ... set other variables
   ```

5. **Deploy**
   ```bash
   git push heroku main
   ```

### DigitalOcean Deployment

1. **Create Droplet** (2GB RAM, 1 vCPU minimum)
2. **Install Node.js and PostgreSQL**
   ```bash
   curl -sL https://deb.nodesource.com/setup_16.x | sudo -E bash -
   sudo apt-get install -y nodejs
   sudo apt-get install -y postgresql postgresql-contrib
   ```

3. **Clone repository**
   ```bash
   git clone <repo-url>
   cd Care\ Konnect
   npm install
   ```

4. **Set up PM2**
   ```bash
   npm install -g pm2
   pm2 start server.js --name "tunzacare"
   pm2 startup
   pm2 save
   ```

5. **Set up Nginx reverse proxy**
   ```bash
   sudo apt-get install -y nginx
   # Configure /etc/nginx/sites-available/tunzacare
   ```

6. **Set up SSL with Let's Encrypt**
   ```bash
   sudo apt-get install -y certbot python3-certbot-nginx
   sudo certbot certonly --nginx -d yourdomain.com
   ```

### AWS Deployment

See [AWS_DEPLOYMENT.md](./AWS_DEPLOYMENT.md) for detailed steps.

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 📝 API Endpoints

### Authentication
- `POST /register/caregiver` - Caregiver registration
- `POST /register/client` - Client registration
- `POST /login` - User login
- `GET /logout` - User logout

### Client Routes
- `GET /client/dashboard` - Client dashboard
- `GET /client/caregivers` - Browse caregivers
- `GET /client/caregiver/:id` - View caregiver profile
- `POST /client/review/:caregiverId` - Submit review
- `GET /client/payment/:caregiverId` - Payment page

### Caregiver Routes
- `GET /caregiver/dashboard` - Caregiver dashboard
- `GET /caregiver/profile/edit` - Edit profile
- `POST /caregiver/profile/update` - Update profile
- `GET /caregiver/subscription` - Subscription page
- `POST /caregiver/subscribe` - Subscribe to plan

### Admin Routes
- `GET /admin/dashboard` - Admin dashboard
- `GET /admin/users` - Manage users
- `GET /admin/verifications` - Pending verifications
- `POST /admin/verify/:id` - Verify caregiver
- `GET /admin/subscriptions` - Subscription management

## 🐛 Troubleshooting

### Database Connection Error
```bash
# Verify PostgreSQL is running
sudo systemctl status postgresql

# Check database exists
psql -l

# Recreate database if needed
dropdb tunzacare_db
createdb tunzacare_db
```

### Port Already in Use
```bash
# Change PORT in .env or use:
PORT=3001 npm start
```

### Module Not Found
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [Sequelize ORM](https://sequelize.org/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [M-Pesa API Documentation](https://developer.safaricom.co.ke/)

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see LICENSE file for details.

## 👥 Support

For support, email: support@tunzacare.co.ke or create an issue in the repository.

## 🎯 Roadmap

- [ ] Mobile app (React Native)
- [ ] Advanced analytics
- [ ] Video calling integration
- [ ] Booking system enhancements
- [ ] Multi-language support
- [ ] SMS notifications

---

**Built with ❤️ for Kenya's families and caregivers**

Last Updated: January 2026
