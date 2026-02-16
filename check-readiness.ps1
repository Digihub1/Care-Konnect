# Care Konnect Deployment Readiness Check (PowerShell)

Write-Host "`n🔍 Checking Care Konnect Deployment Readiness...`n" -ForegroundColor Cyan

$ready = $true
$warnings = 0

# Check Node.js
Write-Host "Checking Node.js..."
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not installed" -ForegroundColor Red
    $ready = $false
}

# Check npm
Write-Host "Checking npm..."
try {
    $npmVersion = npm --version
    Write-Host "✅ npm installed: v$npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm not installed" -ForegroundColor Red
    $ready = $false
}

# Check critical files
Write-Host "`n📁 Checking critical files..."
$files = @("server.js", "models\database.js", "package.json", ".env.example", "Procfile")
foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "✅ $file found" -ForegroundColor Green
    } else {
        Write-Host "❌ $file missing" -ForegroundColor Red
        $ready = $false
    }
}

# Check .gitignore
Write-Host "`n🔐 Checking .gitignore..."
if (Test-Path ".gitignore") {
    $gitignore = Get-Content ".gitignore" -Raw
    if ($gitignore -match ".env") {
        Write-Host "✅ .gitignore protects environment files" -ForegroundColor Green
    } else {
        Write-Host "⚠️  .gitignore doesn't protect .env files" -ForegroundColor Yellow
        $warnings++
    }
} else {
    Write-Host "⚠️  .gitignore file not found" -ForegroundColor Yellow
    $warnings++
}

# Check documentation
Write-Host "`n📚 Checking documentation..."
$docs = @("NEON_QUICKSTART.md", "NEON_DEPLOYMENT.md", "DEPLOYMENT_CHECKLIST.md", "DEPLOYMENT_SUMMARY.md")
foreach ($doc in $docs) {
    if (Test-Path $doc) {
        Write-Host "✅ $doc found" -ForegroundColor Green
    } else {
        Write-Host "⚠️  $doc missing" -ForegroundColor Yellow
        $warnings++
    }
}

# Check environment configuration
Write-Host "`n⚙️  Checking environment configuration..."
if (Test-Path "models\database.js") {
    $dbContent = Get-Content "models\database.js" -Raw
    if ($dbContent -match "DATABASE_URL") {
        Write-Host "✅ DATABASE_URL support configured" -ForegroundColor Green
    } else {
        Write-Host "⚠️  DATABASE_URL support not found" -ForegroundColor Yellow
        $warnings++
    }

    if ($dbContent -match "ssl") {
        Write-Host "✅ SSL support configured" -ForegroundColor Green
    } else {
        Write-Host "⚠️  SSL support not configured" -ForegroundColor Yellow
        $warnings++
    }
}

# Summary
Write-Host "`n================================"
if ($ready) {
    Write-Host "✅ Your application is ready for Neon deployment!" -ForegroundColor Green
    if ($warnings -gt 0) {
        Write-Host "`n⚠️  You have $warnings warning(s) to review above" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ Your application needs some fixes before deployment" -ForegroundColor Red
    Write-Host "   Please address the errors marked with ❌ above"
}
Write-Host "`n================================`n"
Read-Host "Press Enter to exit"