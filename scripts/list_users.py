import psycopg2

conn = psycopg2.connect(
    host="localhost",
    port=5432,
    database="agriease_db",
    user="postgres",
    password="Pass@1234"
)
cursor = conn.cursor()

cursor.execute("SELECT id, email, role FROM users ORDER BY id")
users = cursor.fetchall()

print("📋 Users in database:")
print("-" * 60)
for user in users:
    print(f"ID: {user[0]:<3} | Email: {user[1]:<30} | Role: {user[2]}")
print("-" * 60)

cursor.close()
conn.close()
