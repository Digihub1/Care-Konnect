@echo off
REM Care Konnect Deployment Readiness Check

echo.
echo 🔍 Checking Care Konnect Deployment Readiness...
echo.

setlocal enabledelayedexpansion
set READY=true
set WARNINGS=0

REM Check Node.js
echo Checking Node.js...
where node >nul 2>nul
if !ERRORLEVEL! equ 0 (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo ✅ Node.js installed: !NODE_VERSION!
) else (
    echo ❌ Node.js not installed
    set READY=false
)

REM Check npm
echo Checking npm...
where npm >nul 2>nul
if !ERRORLEVEL! equ 0 (
    for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
    echo ✅ npm installed: v!NPM_VERSION!
) else (
    echo ❌ npm not installed
    set READY=false
)

REM Check critical files
echo.
echo 📁 Checking critical files...

for %%F in (
    "server.js"
    "models\database.js"
    "package.json"
    ".env.example"
    "Procfile"
) do (
    if exist %%F (
        echo ✅ %%F found
    ) else (
        echo ❌ %%F missing
        set READY=false
    )
)

REM Check .gitignore
echo.
echo 🔐 Checking .gitignore...

if exist ".gitignore" (
    findstr ".env" .gitignore >nul
    if !ERRORLEVEL! equ 0 (
        echo ✅ .gitignore protects environment files
    ) else (
        echo ⚠️  .gitignore doesn't protect .env files
        set /a WARNINGS=!WARNINGS! + 1
    )
) else (
    echo ⚠️  .gitignore file not found
    set /a WARNINGS=!WARNINGS! + 1
)

REM Check documentation
echo.
echo 📚 Checking documentation...

for %%D in (
    "NEON_QUICKSTART.md"
    "NEON_DEPLOYMENT.md"
    "DEPLOYMENT_CHECKLIST.md"
    "DEPLOYMENT_SUMMARY.md"
) do (
    if exist %%D (
        echo ✅ %%D found
    ) else (
        echo ⚠️  %%D missing
        set /a WARNINGS=!WARNINGS! + 1
    )
)

REM Check environment configuration
echo.
echo ⚙️  Checking environment configuration...

findstr "DATABASE_URL" models\database.js >nul
if !ERRORLEVEL! equ 0 (
    echo ✅ DATABASE_URL support configured
) else (
    echo ⚠️  DATABASE_URL support not found
    set /a WARNINGS=!WARNINGS! + 1
)

findstr "ssl" models\database.js >nul
if !ERRORLEVEL! equ 0 (
    echo ✅ SSL support configured
) else (
    echo ⚠️  SSL support not configured
    set /a WARNINGS=!WARNINGS! + 1
)

REM Summary
echo.
echo ================================
if "%READY%"=="true" (
    echo ✅ Your application is ready for Neon deployment!
    echo.
    if !WARNINGS! gtr 0 (
        echo ⚠️  You have !WARNINGS! warning(s) to review above
    )
) else (
    echo ❌ Your application needs some fixes before deployment
    echo    Please address the errors marked with ❌ above
)
echo.
echo 📖 Next Steps:
echo    1. Review NEON_QUICKSTART.md
echo    2. Create a Neon project at https://console.neon.tech
echo    3. Generate environment variables: generate-env.bat
echo    4. Test locally: set DATABASE_URL=your_string
echo       Then: npm run dev
echo    5. Deploy to Vercel, Railway, or Heroku
echo.
echo ================================
echo.
pause
