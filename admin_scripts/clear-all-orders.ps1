# Clear All Orders Script - AgriEase (SUPABASE) 
# PowerShell version for better error handling and cross-platform support

Write-Host "================================================" -ForegroundColor Yellow
Write-Host "   Clear All Orders - AgriEase (Supabase)" -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor Yellow
Write-Host ""

# Warning message
Write-Host "WARNING: This will permanently delete ALL orders!" -ForegroundColor Red
Write-Host "This includes:" -ForegroundColor Red
Write-Host "- All orders from farmers" -ForegroundColor Red  
Write-Host "- All order items" -ForegroundColor Red
Write-Host "- All equipment bookings" -ForegroundColor Red
Write-Host ""
Write-Host "Make sure to backup your database before proceeding!" -ForegroundColor Yellow
Write-Host ""

# Confirmation prompt
$confirmation = Read-Host "Type 'CLEAR' to confirm and proceed (or anything else to cancel)"
if ($confirmation -ne "CLEAR") {
    Write-Host "Operation cancelled." -ForegroundColor Green
    exit
}

# Supabase database connection parameters
$DB_HOST = "db.qyqcjqfapdyhkjmrlgbs.supabase.co"
$DB_PORT = "5432" 
$DB_NAME = "postgres"
$DB_USER = "postgres"

Write-Host ""
Write-Host "Connecting to database and clearing all orders..." -ForegroundColor Yellow
Write-Host ""

try {
    # Execute the SQL script
    $env:PGPASSWORD = Read-Host -Prompt "Enter database password" -AsSecureString | ConvertFrom-SecureString -AsPlainText
    
    # Run the SQL script
    & psql -h $DB_HOST -p $DB_PORT -d $DB_NAME -U $DB_USER -f "clear_all_orders.sql"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ All orders successfully cleared!" -ForegroundColor Green
        Write-Host "Both supplier and farmer dashboards are now reset." -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "❌ Error occurred while clearing orders." -ForegroundColor Red
        Write-Host "Please check the error messages above." -ForegroundColor Red
    }
}
catch {
    Write-Host ""
    Write-Host "❌ Failed to execute script: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Yellow
Write-Host "Process completed. Press any key to exit..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")