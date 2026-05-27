import subprocess
import sys

try:
    import psycopg2
except ImportError:
    print('psycopg2 not installed, attempting to install psycopg2-binary...')
    subprocess.check_call([sys.executable, '-m', 'pip', 'install', 'psycopg2-binary'])
    import psycopg2

from psycopg2.extras import RealDictCursor

DB = {
    'host': 'localhost',
    'port': 5432,
    'dbname': 'agriease_db',
    'user': 'postgres',
    'password': 'Pass@1234'
}

EMAIL = 'supplier@gmail.com'

conn = psycopg2.connect(host=DB['host'], port=DB['port'], dbname=DB['dbname'], user=DB['user'], password=DB['password'])
cur = conn.cursor(cursor_factory=RealDictCursor)

cur.execute("DELETE FROM users WHERE email = %s RETURNING id, email", (EMAIL,))
res = cur.fetchall()
conn.commit()
if res:
    print('Deleted rows:')
    print(res)
else:
    print('No rows deleted (row may not exist).')

cur.close()
conn.close()
