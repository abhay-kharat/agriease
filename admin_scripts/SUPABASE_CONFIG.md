# AgriEase Database Configuration - SUPABASE
# All database operations should use these Supabase connection parameters

## 🗄️ Database Configuration

**Primary Database**: Supabase PostgreSQL  
**Note**: All operations are now performed on Supabase, not local PostgreSQL

### Connection Details:
- **Host**: `db.qyqcjqfapdyhkjmrlgbs.supabase.co`
- **Port**: `5432`
- **Database**: `postgres`
- **User**: `postgres`
- **Password**: `Agriease@1234`
- **SSL Mode**: `require`

### Connection String:
```
postgresql://postgres:Agriease@1234@db.qyqcjqfapdyhkjmrlgbs.supabase.co:5432/postgres?sslmode=require
```

### PowerShell Connection:
```powershell
$env:PGPASSWORD='Agriease@1234'
psql -h db.qyqcjqfapdyhkjmrlgbs.supabase.co -p 5432 -d postgres -U postgres
```

### Python Connection (psycopg2):
```python
SUPABASE_DB = {
    "host": "db.qyqcjqfapdyhkjmrlgbs.supabase.co",
    "port": 5432,
    "dbname": "postgres", 
    "user": "postgres",
    "password": "Agriease@1234",
    "sslmode": "require",
}
```

## 📋 Updated Scripts:
All the following scripts now use Supabase by default:
- `clear-all-orders.bat` ✅
- `clear-all-orders.ps1` ✅ 
- `clear_all_orders.sql` ✅
- `add_supabase_products.sql` ✅

## ⚠️ Important Notes:
1. **Always use Supabase** for all database operations
2. **SSL is required** for Supabase connections
3. **No more local PostgreSQL** operations unless specifically needed for testing
4. **Backup through Supabase dashboard** before major operations

## 🔄 For Future Reference:
When creating new database scripts, always use the Supabase connection parameters above.