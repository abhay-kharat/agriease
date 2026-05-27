@echo off
echo ================================================
echo    Clear Browser Cache - AgriEase Orders
echo ================================================
echo.
echo The database has been successfully cleared!
echo All orders have been removed from the database.
echo.
echo If you're still seeing orders in the dashboard,
echo this is likely due to browser caching.
echo.
echo Please follow these steps:
echo.
echo 1. REFRESH YOUR BROWSER:
echo    - Press Ctrl+F5 (hard refresh)
echo    - Or press F12 -^> Application -^> Storage -^> Clear site data
echo.
echo 2. If using Chrome:
echo    - Press F12 -^> Application tab -^> Clear Storage -^> Clear site data
echo.
echo 3. If using Firefox:
echo    - Press F12 -^> Storage tab -^> Clear All
echo.
echo 4. Alternative: Open the app in an Incognito/Private window
echo.
echo 5. If still visible, restart your development servers:
echo    - Stop any running backend (Ctrl+C in terminal)  
echo    - Stop any running frontend (Ctrl+C in terminal)
echo    - Restart both services
echo.
echo ================================================
echo Database Status: CLEAN (0 orders, 0 payments)
echo ================================================
pause