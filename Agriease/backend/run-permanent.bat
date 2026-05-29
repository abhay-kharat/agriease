@echo off
echo [PERMANENT STORAGE] Starting AgriEase Backend with Supabase Cloud Database...
cd /d "%~dp0"
set SPRING_PROFILES_ACTIVE=default
mvnw.cmd spring-boot:run
pause