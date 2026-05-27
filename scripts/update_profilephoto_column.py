#!/usr/bin/env python3
"""
Script to update the users table to add/modify columns for profile features:
- profile_photo: TEXT for storing base64 encoded images
- business_name: VARCHAR(200) for supplier business name
- business_type: VARCHAR(100) for supplier business type
"""

import psycopg2
from psycopg2 import sql

# Database connection parameters
DB_CONFIG = {
    'host': 'localhost',
    'port': 5432,
    'database': 'agriease_db',
    'user': 'postgres',
    'password': 'Pass@1234'
}

def update_users_columns():
    """Update the users table with profile-related columns"""
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()
        
        columns_to_update = [
            ('profile_photo', 'TEXT'),
            ('business_name', 'VARCHAR(200)'),
            ('business_type', 'VARCHAR(100)')
        ]
        
        for column_name, column_type in columns_to_update:
            # Check if column exists
            cursor.execute("""
                SELECT column_name, data_type, character_maximum_length
                FROM information_schema.columns
                WHERE table_name = 'users' AND column_name = %s
            """, (column_name,))
            
            column_info = cursor.fetchone()
            
            if column_info:
                print(f"Current {column_name} column: {column_info}")
                # Update column type if needed
                if column_type == 'TEXT' and column_info[1] != 'text':
                    print(f"Updating {column_name} column to {column_type}...")
                    cursor.execute(f"""
                        ALTER TABLE users 
                        ALTER COLUMN {column_name} TYPE TEXT
                    """)
                    conn.commit()
                    print(f"✓ {column_name} column updated to {column_type} successfully!")
                else:
                    print(f"✓ {column_name} column has correct type")
            else:
                print(f"{column_name} column doesn't exist, adding it...")
                cursor.execute(f"""
                    ALTER TABLE users 
                    ADD COLUMN {column_name} {column_type}
                """)
                conn.commit()
                print(f"✓ {column_name} column added successfully!")
        
        # Verify the changes
        print("\n=== Final column info ===")
        cursor.execute("""
            SELECT column_name, data_type, character_maximum_length
            FROM information_schema.columns
            WHERE table_name = 'users' 
            AND column_name IN ('profile_photo', 'business_name', 'business_type')
            ORDER BY column_name
        """)
        results = cursor.fetchall()
        for result in results:
            print(f"{result[0]}: {result[1]}" + (f"({result[2]})" if result[2] else ""))
        
        cursor.close()
        conn.close()
        
    except psycopg2.Error as e:
        print(f"❌ Database error: {e}")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    print("Updating users table columns for profile features...")
    update_users_columns()
