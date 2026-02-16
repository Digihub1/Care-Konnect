#!/bin/bash
# Generate secure environment variables for Care Konnect deployment

echo "🔐 Generating secure environment variables for Care Konnect..."
echo ""

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Generate SESSION_SECRET (32 characters)
SESSION_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")

# Generate JWT_SECRET (64 characters)
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")

# Generate ENCRYPTION_KEY (32 characters)
ENCRYPTION_KEY=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")

# Create .env.production file
cat > .env.production << EOF
# Care Konnect - Production Configuration for Neon
# Generated on $(date)

# ========================================
# DATABASE CONFIGURATION (Neon PostgreSQL)
# ========================================
# Paste your Neon connection string here
DATABASE_URL=postgresql://user:password@region.neon.tech/care_konnect_db

# ========================================
# SERVER CONFIGURATION
# ========================================
PORT=3000
NODE_ENV=production

# ========================================
# SESSION & SECURITY (Auto-generated)
# ========================================
SESSION_SECRET=${SESSION_SECRET}
JWT_SECRET=${JWT_SECRET}
ENCRYPTION_KEY=${ENCRYPTION_KEY}

# ========================================
# EMAIL CONFIGURATION
# ========================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@care-konnect.co.ke

# ========================================
# M-PESA PAYMENT CONFIGURATION
# ========================================
MPESA_CONSUMER_KEY=your-consumer-key
MPESA_CONSUMER_SECRET=your-consumer-secret
MPESA_SHORTCODE=your-shortcode
MPESA_PASSKEY=your-passkey
EOF

# Display the generated values
echo "✅ Generated secure environment variables:"
echo ""
echo "📝 SESSION_SECRET (32 chars):"
echo "   $SESSION_SECRET"
echo ""
echo "📝 JWT_SECRET (64 chars):"
echo "   $JWT_SECRET"
echo ""
echo "📝 ENCRYPTION_KEY (32 chars):"
echo "   $ENCRYPTION_KEY"
echo ""
echo "📁 Saved to: .env.production"
echo ""
echo "⚠️  IMPORTANT:"
echo "   1. Add your DATABASE_URL from Neon to .env.production"
echo "   2. Add your email and M-Pesa credentials"
echo "   3. Do NOT commit .env.production to Git"
echo "   4. Add .env.production to .gitignore"
echo ""
echo "✅ Ready to deploy!"
