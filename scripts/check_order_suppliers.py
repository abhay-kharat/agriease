import psycopg2
from psycopg2.extras import RealDictCursor

# Database connection parameters
DB_PARAMS = {
    'dbname': 'agriease_db',
    'user': 'postgres',
    'password': 'Pass@1234',
    'host': 'localhost',
    'port': '5432'
}

def check_orders():
    try:
        conn = psycopg2.connect(**DB_PARAMS, cursor_factory=RealDictCursor)
        cursor = conn.cursor()
        
        print("=" * 80)
        print("CHECKING RECENT ORDERS AND THEIR SUPPLIERS")
        print("=" * 80)
        
        # Get recent orders
        cursor.execute("""
            SELECT 
                o.id as order_id,
                o.status,
                o.payment_status,
                o.payment_method,
                o.created_at,
                u.email as farmer_email,
                u.name as farmer_name
            FROM orders o
            JOIN users u ON o.user_id = u.id
            ORDER BY o.created_at DESC
            LIMIT 10
        """)
        
        orders = cursor.fetchall()
        
        for order in orders:
            print(f"\n📦 Order #{order['order_id']}")
            print(f"   Status: {order['status']}")
            print(f"   Payment: {order['payment_status']} ({order['payment_method']})")
            print(f"   Farmer: {order['farmer_name']} ({order['farmer_email']})")
            print(f"   Created: {order['created_at']}")
            
            # Get order items and their suppliers
            cursor.execute("""
                SELECT 
                    oi.id as item_id,
                    oi.name as item_name,
                    oi.product_type,
                    oi.supplier_id,
                    s.email as supplier_email,
                    s.name as supplier_name
                FROM order_items oi
                LEFT JOIN users s ON oi.supplier_id = s.id
                WHERE oi.order_id = %s
            """, (order['order_id'],))
            
            items = cursor.fetchall()
            
            if items:
                print(f"   Items ({len(items)}):")
                for item in items:
                    if item['supplier_id']:
                        print(f"     ✓ {item['item_name']} - Supplier: {item['supplier_name']} ({item['supplier_email']})")
                    else:
                        print(f"     ✗ {item['item_name']} - NO SUPPLIER ASSIGNED! ⚠️")
            else:
                print("     No items found")
        
        print("\n" + "=" * 80)
        print("CHECKING PRODUCTS WITH SUPPLIERS")
        print("=" * 80)
        
        cursor.execute("""
            SELECT 
                p.id,
                p.name,
                p.type,
                p.supplier_id,
                u.email as supplier_email,
                u.name as supplier_name
            FROM products p
            LEFT JOIN users u ON p.supplier_id = u.id
            ORDER BY p.id DESC
            LIMIT 10
        """)
        
        products = cursor.fetchall()
        
        for product in products:
            if product['supplier_id']:
                print(f"✓ Product #{product['id']}: {product['name']} - Supplier: {product['supplier_name']}")
            else:
                print(f"✗ Product #{product['id']}: {product['name']} - NO SUPPLIER! ⚠️")
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_orders()
