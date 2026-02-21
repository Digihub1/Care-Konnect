// Minimal Express server for Vercel testing
require('dotenv').config();
const express = require('express');
const app = express();

// Check if running on Vercel
const isVercel = !!process.env.VERCEL;

console.log('✅ Express app initialized');
console.log('🌍 Environment:', process.env.NODE_ENV, '| Vercel:', isVercel);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString(),
        message: 'Care Konnect is running'
    });
});

// Setup endpoint
app.get('/setup', (req, res) => {
    const hasDatabaseUrl = !!process.env.DATABASE_URL;
    res.json({
        status: 'pending_setup',
        isDatabaseConfigured: hasDatabaseUrl,
        message: hasDatabaseUrl 
            ? '✅ DATABASE_URL is configured'
            : '⚠️ DATABASE_URL is not set',
        nextSteps: [
            '1. Create a Neon PostgreSQL project at https://console.neon.tech',
            '2. Copy your DATABASE_URL connection string',
            '3. Add DATABASE_URL to Vercel Project Settings → Environment Variables',
            '4. Redeploy the application'
        ]
    });
});

// Home page
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to Care Konnect',
        uptime: process.uptime(),
        nodeVersion: process.version,
        endpoints: {
            health: '/health',
            setup: '/setup'
        }
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        path: req.path,
        message: 'This endpoint does not exist'
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred'
    });
});

// Export for Vercel
if (isVercel) {
    console.log('✅ Exporting app for Vercel serverless');
    module.exports = app;
} else {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}
