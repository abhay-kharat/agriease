@echo off
echo ================================================
echo   Clear All Orders - AgriEase (Supabase)
echo ================================================
echo.
echo WARNING: This will permanently delete all orders!
echo Make sure to backup your database before proceeding.
echo.
echo Press any key to continue or Ctrl+C to cancel...
pause >nul

echo.
echo Connecting to Supabase and clearing all orders...
echo.

REM Supabase PostgreSQL connection
set DB_HOST=db.qyqcjqfapdyhkjmrlgbs.supabase.co
set DB_PORT=5432
set DB_NAME=postgres
set DB_USER=postgres
set DB_SSLMODE=require

echo Enter Supabase database password when prompted.

REM Execute the clear orders script on Supabase
psql "host=%DB_HOST% port=%DB_PORT% dbname=%DB_NAME% user=%DB_USER% sslmode=%DB_SSLMODE%" -f clear_all_orders.sql

echo.
echo ================================================
echo Process completed. Check the output above for results.
echo ================================================
pause
