import psycopg2
from datetime import datetime

# Database connection
conn = psycopg2.connect(
    host="localhost",
    port=5432,
    database="agriease_db",
    user="postgres",
    password="Pass@1234"
)
cur = conn.cursor()

print("=" * 60)
print("AgriEase - Order Status Verification")
print("=" * 60)

try:
    # Check orders table structure
    print("\n1. Checking orders table structure...")
    cur.execute("""
        SELECT column_name, data_type, column_default 
        FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name IN ('status', 'payment_status')
        ORDER BY column_name;
    """)
    
    columns = cur.fetchall()
    print("   Order table columns:")
    for col in columns:
        print(f"   - {col[0]}: {col[1]} (default: {col[2]})")
    
    # Check current order statuses
    print("\n2. Checking current orders and their statuses...")
    cur.execute("""
        SELECT 
            id, 
            status, 
            payment_status,
            payment_method,
            created_at
        FROM orders 
        ORDER BY created_at DESC 
        LIMIT 10;
    """)
    
    orders = cur.fetchall()
    if orders:
        print(f"   Found {len(orders)} recent orders:")
        print(f"   {'ID':<8} {'Status':<12} {'Payment':<10} {'Method':<10} {'Created'}")
        print("   " + "-" * 70)
        for order in orders:
            print(f"   {order[0]:<8} {order[1]:<12} {order[2]:<10} {order[3]:<10} {order[4]}")
    else:
        print("   No orders found in database")
    
    # Check payments table
    print("\n3. Checking payments table...")
    cur.execute("""
        SELECT COUNT(*) FROM information_schema.tables 
        WHERE table_name = 'payments';
    """)
    
    payments_exists = cur.fetchone()[0]
    if payments_exists:
        cur.execute("""
            SELECT 
                p.id,
                p.order_id,
                p.status as payment_status,
                p.payment_method,
                o.status as order_status
            FROM payments p
            LEFT JOIN orders o ON p.order_id = o.id
            ORDER BY p.created_at DESC
            LIMIT 5;
        """)
        
        payments = cur.fetchall()
        if payments:
            print(f"   Found {len(payments)} recent payments:")
            print(f"   {'Pay ID':<8} {'Order ID':<10} {'Pay Status':<12} {'Method':<10} {'Order Status'}")
            print("   " + "-" * 70)
            for payment in payments:
                print(f"   {payment[0]:<8} {payment[1]:<10} {payment[2]:<12} {payment[3]:<10} {payment[4]}")
        else:
            print("   No payments found")
    else:
        print("   ⚠️  Payments table does not exist yet!")
    
    # Summary
    print("\n4. Order Status Summary:")
    cur.execute("""
        SELECT status, COUNT(*) as count
        FROM orders
        GROUP BY status
        ORDER BY count DESC;
    """)
    
    status_summary = cur.fetchall()
    if status_summary:
        for status in status_summary:
            print(f"   {status[0]}: {status[1]} orders")
    else:
        print("   No orders in database")
    
    print("\n" + "=" * 60)
    print("✅ Verification Complete!")
    print("=" * 60)
    print("\nExpected behavior:")
    print("- New orders should have status = 'PENDING'")
    print("- After payment: payment_status = 'PAID', status = 'PENDING'")
    print("- After supplier confirms: status = 'CONFIRMED'")
    print("\nIf you see orders with status='CONFIRMED' immediately after")
    print("payment, the backend may need to be restarted with the new code.")
    print("=" * 60)
    
except Exception as e:
    print(f"\n❌ Error: {e}")
    conn.rollback()
finally:
    cur.close()
    conn.close()
