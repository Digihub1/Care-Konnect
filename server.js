require('dotenv').config();
const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const { sequelize } = require('./models/database');

// Detect platform
const isVercel = !!process.env.VERCEL;

// Validate required environment variables
const requiredEnvVars = ['NODE_ENV', 'SESSION_SECRET'];
// DATABASE_URL can come from Neon connection string OR individual DB variables
const hasDatabaseConfig = process.env.DATABASE_URL || (process.env.DB_HOST && process.env.DB_USER && process.env.DB_NAME);
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

let missingConfig = false;
if (missingEnvVars.length > 0 || !hasDatabaseConfig) {
    const missing = missingEnvVars.length > 0 ? missingEnvVars.join(', ') : '';
    const dbMissing = !hasDatabaseConfig ? 'DATABASE_URL or (DB_HOST, DB_USER, DB_NAME)' : '';
    const allMissing = [missing, dbMissing].filter(Boolean).join(', ');
    console.error(`❌ Missing required environment variables: ${allMissing}`);
    missingConfig = true;
    if (!isVercel) {
        // In non-serverless environments we exit because the app requires these to run
        process.exit(1);
    } else {
        // On Vercel, do not exit: export the app instead so the deployment can succeed
        console.warn('Running on Vercel without full config; exporting app for serverless environment.');
    }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

// Route imports
const authRoutes = require('./routes/auth');
const clientRoutes = require('./routes/clients');
const caregiverRoutes = require('./routes/caregiver');
const adminRoutes = require('./routes/admin');

const app = express();

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"]
        }
    }
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Login rate limiting (stricter) - applied in auth routes
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    skipSuccessfulRequests: true,
    message: 'Too many login attempts, please try again after 15 minutes.'
});

// Data sanitization
app.use(mongoSanitize());
app.use(xss());

// CORS Configuration
const corsOptions = {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: !!process.env.CORS_ORIGIN, // Enable credentials only when specific origin is set
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files
app.use(express.static(path.join(__dirname, 'Public')));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: 'strict'
    }
}));

// Flash messages
app.use(flash());

// Global variables middleware
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.currentUser = req.session.user;
    res.locals.userType = req.session.userType;
    next();
});

// Database synchronization and server startup
const startServer = async () => {
    try {
        if (!missingConfig && hasDatabaseConfig) {
            await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
            console.log('✅ Database synchronized');
        } else {
            console.warn('Skipping database sync due to missing configuration.');
        }

        // If running on Vercel (serverless), export the app instead of starting a listener
        if (isVercel) {
            module.exports = app;
            console.log('Exported Express app for Vercel serverless deployment.');
            return;
        }

        // Start listening only after DB is ready (non-serverless environments)
        const PORT = process.env.PORT || 3000;
        const server = app.listen(PORT, () => {
            console.log(`\n✅ TunzaCare Portal running on port ${PORT}`);
            console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
            console.log(`📍 Portal Name: TunzaCare (from Swahili "Tunza" meaning "to care for")\n`);
        });

        // Graceful shutdown
        process.on('SIGTERM', () => {
            console.log('SIGTERM received, shutting down gracefully...');
            server.close(async () => {
                console.log('Server closed');
                await sequelize.close();
                process.exit(0);
            });
        });
    } catch (err) {
        console.error('❌ Database sync error:', err);
        if (!isVercel) process.exit(1);
        throw err;
    }
};

// Routes
app.use('/', authRoutes);
app.use('/client', clientRoutes);
app.use('/caregiver', caregiverRoutes);
app.use('/admin', adminRoutes);

// Home route
app.get('/', (req, res) => {
    res.render('index', {
        title: 'TunzaCare - Home',
        page: 'home'
    });
});

// About page
app.get('/about', (req, res) => {
    res.render('about', {
        title: 'About TunzaCare',
        page: 'about'
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    const status = err.status || 500;
    const isDev = process.env.NODE_ENV === 'development';
    
    console.error(`[${new Date().toISOString()}] Error: ${err.message}`, isDev ? err.stack : '');
    
    res.status(status).render('error', {
        title: 'Error',
        message: isDev ? err.message : 'Something went wrong. Our team has been notified.',
        error: isDev ? err : {}
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).render('error', {
        title: 'Page Not Found',
        message: 'The page you are looking for does not exist.',
        error: {}
    });
});

// Start server
startServer();