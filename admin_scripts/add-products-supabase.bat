@echo off
echo ================================================
echo    Add Products to Supabase - AgriEase
echo ================================================
echo.
echo This will add sample products to the Supabase database.
echo.
echo Press any key to continue or Ctrl+C to cancel...
pause >nul

echo.
echo Connecting to Supabase and adding products...
echo.

REM Supabase PostgreSQL connection
set PGPASSWORD=Agriease@1234

REM Execute the add products script on Supabase
psql -h db.qyqcjqfapdyhkjmrlgbs.supabase.co -p 5432 -d postgres -U postgres -f add_supabase_products.sql

echo.
echo ================================================
echo Process completed. Products added to Supabase!
echo ================================================
pause