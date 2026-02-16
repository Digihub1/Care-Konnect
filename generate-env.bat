@echo off
REM Generate secure environment variables for Care Konnect deployment

echo.
echo 🔐 Generating secure environment variables for Care Konnect...
echo.

REM Check if Node.js is available
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

REM Generate SESSION_SECRET (32 characters)
for /f "delims=" %%A in ('node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"') do set SESSION_SECRET=%%A

REM Generate JWT_SECRET (64 characters)
for /f "delims=" %%A in ('node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"') do set JWT_SECRET=%%A

REM Generate ENCRYPTION_KEY (32 characters)
for /f "delims=" %%A in ('node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"') do set ENCRYPTION_KEY=%%A

REM Create .env.production file
(
echo # Care Konnect - Production Configuration for Neon
echo # Generated on %date% %time%
echo.
echo # ========================================
echo # DATABASE CONFIGURATION ^(Neon PostgreSQL^)
echo # ========================================
echo # Paste your Neon connection string here
echo DATABASE_URL=postgresql://user:password@region.neon.tech/care_konnect_db
echo.
echo # ========================================
echo # SERVER CONFIGURATION
echo # ========================================
echo PORT=3000
echo NODE_ENV=production
echo.
echo # ========================================
echo # SESSION ^& SECURITY ^(Auto-generated^)
echo # ========================================
echo SESSION_SECRET=%SESSION_SECRET%
echo JWT_SECRET=%JWT_SECRET%
echo ENCRYPTION_KEY=%ENCRYPTION_KEY%
echo.
echo # ========================================
echo # EMAIL CONFIGURATION
echo # ========================================
echo SMTP_HOST=smtp.gmail.com
echo SMTP_PORT=587
echo SMTP_USER=your-email@gmail.com
echo SMTP_PASS=your-app-password
echo EMAIL_FROM=noreply@care-konnect.co.ke
echo.
echo # ========================================
echo # M-PESA PAYMENT CONFIGURATION
echo # ========================================
echo MPESA_CONSUMER_KEY=your-consumer-key
echo MPESA_CONSUMER_SECRET=your-consumer-secret
echo MPESA_SHORTCODE=your-shortcode
echo MPESA_PASSKEY=your-passkey
) > .env.production

REM Automatically add .env.production to .gitignore if it exists
if exist .gitignore (
    findstr /C:".env.production" .gitignore >nul 2>&1
    if %ERRORLEVEL% NEQ 0 (
        echo.>> .gitignore
        echo .env.production>> .gitignore
        echo ✅ Added .env.production to .gitignore
    ) else (
        echo ✅ .env.production is already in .gitignore
    )
)

REM Display the generated values
echo ✅ Generated secure environment variables:
echo.
echo 📝 SESSION_SECRET ^(32 chars^):
echo    %SESSION_SECRET%
echo.
echo 📝 JWT_SECRET ^(64 chars^):
echo    %JWT_SECRET%
echo.
echo 📝 ENCRYPTION_KEY ^(32 chars^):
echo    %ENCRYPTION_KEY%
echo.
echo 📁 Saved to: .env.production
echo.
echo ⚠️  IMPORTANT:
echo    1. Add your DATABASE_URL from Neon to .env.production
echo    2. Add your email and M-Pesa credentials
echo    3. Do NOT commit .env.production to Git
echo    4. Ensure .env.production is in .gitignore (Checked automatically)
echo.
echo ✅ Ready to deploy!
echo.
pause
