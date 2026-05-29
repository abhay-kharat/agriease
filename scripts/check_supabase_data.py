import psycopg2
from psycopg2.extras import RealDictCursor

SUPABASE_DB = {
    "host": "db.qyqcjqfapdyhkjmrlgbs.supabase.co",
    "port": 5432,
    "dbname": "postgres",
    "user": "postgres",
    "password": "Agriease@1234",
    "sslmode": "require",
}

def check_supabase():
    try:
        conn = psycopg2.connect(**SUPABASE_DB)
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        tables = ['users', 'products', 'equipment', 'orders', 'bookings']
        
        for table in tables:
            cur.execute(f"SELECT COUNT(*) as count FROM {table}")
            count = cur.fetchone()['count']
            print(f"Table '{table}': {count} rows")
            
            if table == 'users':
                cur.execute("SELECT id, email, role FROM users")
                users = cur.fetchall()
                for user in users:
                    print(f"  User ID: {user['id']} | Email: {user['email']} | Role: {user['role']}")
            elif count > 0:
                cur.execute(f"SELECT * FROM {table} LIMIT 1")
                sample = cur.fetchone()
                print(f"  Sample row from '{table}': {sample}")
        
        cur.close()
        conn.close()
    except Exception as e:
        print(f"Error checking Supabase: {e}")

if __name__ == "__main__":
    check_supabase()
