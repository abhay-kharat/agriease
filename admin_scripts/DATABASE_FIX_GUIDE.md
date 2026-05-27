# 🚨 AgriEase Database Connection Issue - Troubleshooting Guide

## Problem
Your Spring Boot application cannot connect to the Supabase database at `db.qyqcjqfapdyhkjmrlgbs.supabase.co`. The hostname resolves inconsistently, suggesting the Supabase project may be paused, deleted, or experiencing connectivity issues.

## Error Details
- **Root Cause**: `java.net.UnknownHostException: db.qyqcjqfapdyhkjmrlgbs.supabase.co`
- **Impact**: Application fails to start, cannot access database
- **Error Type**: JDBC Connection Exception

## 🔧 Immediate Solutions

### Solution 1: Test with H2 In-Memory Database (FASTEST)
```batch
# Run this command from the backend folder:
cd "C:\College+Study\BE\BE Projects\demo\NEWPROJCT\Agriease\backend"
run-with-h2.bat
```

**Or manually:**
```batch
set SPRING_PROFILES_ACTIVE=h2
mvnw.cmd spring-boot:run
```

✅ **Benefits:**
- No external database needed
- Fastest way to test your application
- Data resets each restart (good for testing)
- H2 console available at: http://localhost:8080/h2-console

### Solution 2: Set up Local PostgreSQL Database
1. **Install PostgreSQL locally** (if not already installed)
2. **Create database:**
   ```sql
   CREATE DATABASE agriease_dev;
   ```
3. **Run with local profile:**
   ```batch
   run-with-local-db.bat
   ```

### Solution 3: Fix Supabase Connection
1. **Check your Supabase Dashboard:**
   - Visit: https://supabase.com/dashboard
   - Verify your project status
   - Check if project is paused (free tier auto-pauses after 1 week of inactivity)
   - Look for updated connection details

2. **Restart/Unpause Supabase project** if paused

3. **Update connection details** if they've changed

## 📁 Files Created
- `application-h2.properties` - H2 in-memory database config
- `application-local.properties` - Local PostgreSQL config  
- `run-with-h2.bat` - Quick H2 startup script
- `run-with-local-db.bat` - Local database startup script

## 🔍 Quick Diagnostics

### Test Database Connectivity
```powershell
# Test DNS resolution
nslookup db.qyqcjqfapdyhkjmrlgbs.supabase.co

# Test direct connection (requires psql)
$env:PGPASSWORD='Agriease@1234'
psql -h db.qyqcjqfapdyhkjmrlgbs.supabase.co -p 5432 -d postgres -U postgres -c '\conninfo'
```

### Check Application Health
```bash
# Once app starts successfully:
curl http://localhost:8080/agriease/health
```

## 🎯 Recommended Next Steps

1. **FIRST**: Try `run-with-h2.bat` to verify your app works with a database
2. **SECOND**: Check your Supabase dashboard and unpause/restart if needed  
3. **THIRD**: Set up local PostgreSQL for development independence
4. **LAST**: Update production config once Supabase is working

## 📚 Profile Usage
- **Default**: Uses Supabase (current broken config)
- **h2**: Uses H2 in-memory database (good for testing)
- **local**: Uses local PostgreSQL (good for development)

## 🚀 Quick Start Command
```batch
# Start with H2 database immediately:
cd "C:\College+Study\BE\BE Projects\demo\NEWPROJCT\Agriease\backend"
set SPRING_PROFILES_ACTIVE=h2 && mvnw.cmd spring-boot:run
```

## 💡 Pro Tips
- H2 Console URL: `http://localhost:8080/h2-console`
- H2 JDBC URL: `jdbc:h2:mem:testdb`
- H2 Username: `sa`, Password: (empty)
- Your app will be available at: `http://localhost:8080/agriease`