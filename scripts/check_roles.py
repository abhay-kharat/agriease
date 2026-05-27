import psycopg2

conn = psycopg2.connect(
    dbname='agriease_db',
    user='postgres',
    password='Pass@1234',
    host='localhost'
)

cur = conn.cursor()
cur.execute('SELECT email, role FROM users LIMIT 10')

print('Email | Role')
print('-' * 50)
for row in cur.fetchall():
    print(f'{row[0]} | {row[1]}')

cur.close()
conn.close()
