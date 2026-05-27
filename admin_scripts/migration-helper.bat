@echo off
echo ====================================
echo  Order Number Migration Options
echo ====================================
echo.
echo Choose your method:
echo 1. Run with password prompt (default)
echo 2. Run with specific database name
echo 3. Show connection help
echo 4. Exit
echo.
set /p choice="Enter choice (1-4): "

if "%choice%"=="1" goto :method1
if "%choice%"=="2" goto :method2
if "%choice%"=="3" goto :help
if "%choice%"=="4" goto :exit
goto :method1

:method1
echo.
echo Running with default settings...
psql -U postgres -d agriease_db -f migration_add_display_order_number.sql
goto :done

:method2
echo.
set /p dbname="Enter database name: "
set /p username="Enter username (default: postgres): "
if "%username%"=="" set username=postgres
echo Running migration for database: %dbname%
psql -U %username% -d %dbname% -f migration_add_display_order_number.sql
goto :done

:help
echo.
echo ====================================
echo  Connection Help
echo ====================================
echo.
echo If psql command fails:
echo 1. Check if PostgreSQL is running
echo 2. Verify database name (common: agriease_db, agriease, postgres)
echo 3. Check username (common: postgres, your_username)
echo 4. Alternative: Run manual_migration.sql in pgAdmin/DBeaver
echo.
echo Common connection strings:
echo   psql -U postgres -d agriease_db
echo   psql -U your_username -d agriease_db -h localhost
echo.
pause
goto :start

:done
echo.
if %errorlevel% equ 0 (
    echo ✓ Migration completed successfully!
) else (
    echo ✗ Migration failed. Try manual_migration.sql instead.
)
echo.

:exit
pause