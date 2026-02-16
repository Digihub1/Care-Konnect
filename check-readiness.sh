#!/bin/bash
# Care Konnect Deployment Readiness Check

echo "🔍 Checking Care Konnect Deployment Readiness..."
echo ""

READY=true
WARNINGS=0

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "✅ Node.js installed: $NODE_VERSION"
else
    echo "❌ Node.js not installed"
    READY=false
fi

# Check npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo "✅ npm installed: v$NPM_VERSION"
else
    echo "❌ npm not installed"
    READY=false
fi

# Check critical files
echo ""
echo "📁 Checking critical files..."

FILES=(
    "server.js"
    "models/database.js"
    "package.json"
    ".env.example"
    "Procfile"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file found"
    else
        echo "❌ $file missing"
        READY=false
    fi
done

# Check dependencies file
echo ""
echo "📦 Checking dependencies configuration..."

if grep -q "sequelize" package.json; then
    echo "✅ Sequelize configured"
else
    echo "⚠️  Sequelize not in dependencies"
    WARNINGS=$((WARNINGS + 1))
fi

if grep -q "pg" package.json; then
    echo "✅ PostgreSQL driver configured"
else
    echo "❌ PostgreSQL driver missing (need: npm install pg)"
    READY=false
fi

if grep -q "dotenv" package.json; then
    echo "✅ dotenv configured"
else
    echo "⚠️  dotenv not configured"
    WARNINGS=$((WARNINGS + 1))
fi

# Check .gitignore
echo ""
echo "🔐 Checking .gitignore..."

if [ -f ".gitignore" ]; then
    if grep -q ".env" .gitignore; then
        echo "✅ .gitignore protects environment files"
    else
        echo "⚠️  .gitignore doesn't protect .env files"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo "⚠️  .gitignore file not found"
    WARNINGS=$((WARNINGS + 1))
fi

# Check documentation
echo ""
echo "📚 Checking documentation..."

DOCS=(
    "NEON_QUICKSTART.md"
    "NEON_DEPLOYMENT.md"
    "DEPLOYMENT_CHECKLIST.md"
    "DEPLOYMENT_SUMMARY.md"
)

for doc in "${DOCS[@]}"; do
    if [ -f "$doc" ]; then
        echo "✅ $doc found"
    else
        echo "⚠️  $doc missing"
        WARNINGS=$((WARNINGS + 1))
    fi
done

# Check environment configuration
echo ""
echo "⚙️  Checking environment configuration..."

if grep -q "DATABASE_URL" models/database.js; then
    echo "✅ DATABASE_URL support configured"
else
    echo "⚠️  DATABASE_URL support not found"
    WARNINGS=$((WARNINGS + 1))
fi

if grep -q "ssl" models/database.js; then
    echo "✅ SSL support configured"
else
    echo "⚠️  SSL support not configured"
    WARNINGS=$((WARNINGS + 1))
fi

# Summary
echo ""
echo "================================"
if [ "$READY" = true ]; then
    echo "✅ Your application is ready for Neon deployment!"
    echo ""
    if [ $WARNINGS -gt 0 ]; then
        echo "⚠️  You have $WARNINGS warning(s) to review above"
    fi
else
    echo "❌ Your application needs some fixes before deployment"
    echo "   Please address the errors marked with ❌ above"
fi
echo ""
echo "📖 Next Steps:"
echo "   1. Review NEON_QUICKSTART.md"
echo "   2. Create a Neon project at https://console.neon.tech"
echo "   3. Generate environment variables: bash generate-env.sh"
echo "   4. Test locally: DATABASE_URL='your_string' npm run dev"
echo "   5. Deploy to Vercel, Railway, or Heroku"
echo ""
echo "================================"
