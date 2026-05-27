# Clear Orders Documentation

This directory contains scripts to clear/reset orders from both supplier and farmer dashboards in the AgriEase application.

## ⚠️ Important Warning
**Always backup your database before running any of these scripts!**

## Available Options

### Option 1: Complete Order Deletion (Destructive) 
**Files: `clear_all_orders.sql`, `clear-all-orders.bat`, `clear-all-orders.ps1`**

This completely removes all order data from the database:
- Deletes all orders
- Deletes all order items 
- Deletes all equipment bookings
- Resets auto-increment sequences

**Use this when:** You want to completely start fresh with no order history.

### Option 2: Reset to Zero (Safe)
**File: `reset_orders_to_zero.sql`**

This sets all quantities to 0 but preserves order records:
- Sets all order item quantities to 0
- Sets all order totals to 0.00
- Changes all order statuses to 'CANCELLED'
- Cancels all active bookings

**Use this when:** You want to reset the dashboard counts but keep order history for reporting.

## How to Execute

### Method 1: Direct SQL Execution
1. Connect to your PostgreSQL database using pgAdmin, DBeaver, or psql
2. Run the SQL file of your choice:
   - `clear_all_orders.sql` (destructive)
   - `reset_orders_to_zero.sql` (safe)

### Method 2: Batch File (Windows)
```bash
# For complete clearing
double-click clear-all-orders.bat

# Update connection parameters in the .bat file first:
# set DB_HOST=localhost
# set DB_PORT=5432  
# set DB_NAME=agriease
# set DB_USER=postgres
```

### Method 3: PowerShell (Recommended)
```powershell
# For complete clearing with better error handling
.\clear-all-orders.ps1

# You will be prompted for:
# - Confirmation (type 'CLEAR')
# - Database password
```

### Method 4: Command Line
```bash
# Update connection parameters as needed
psql -h localhost -p 5432 -d agriease -U postgres -f clear_all_orders.sql
# or
psql -h localhost -p 5432 -d agriease -U postgres -f reset_orders_to_zero.sql
```

## Database Tables Affected

| Table | Complete Clear | Reset to Zero |
|-------|---------------|---------------|
| `orders` | ❌ Deleted | ✅ Set total_amount=0, status='CANCELLED' |
| `order_items` | ❌ Deleted | ✅ Set quantity=0 |
| `bookings` | ❌ Deleted | ✅ Set status='CANCELLED' |

## Verification

Both scripts include verification queries to confirm the operation succeeded:
- Order counts
- Item counts  
- Booking counts

## Rollback

❌ **Complete Clear**: No rollback possible - data is permanently deleted
✅ **Reset to Zero**: Orders still exist, can be manually restored if needed

## Configuration

Update database connection parameters in the script files:
- **Host**: Usually `localhost`
- **Port**: Usually `5432`
- **Database**: Usually `agriease`
- **User**: Usually `postgres`
- **Password**: Prompted when using PowerShell script

## Testing

It's recommended to test these scripts on a development database first before running on production data.