import subprocess, sys
try:
    import psycopg2
except ImportError:
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
conn = psycopg2.connect(**DB)
cur = conn.cursor(cursor_factory=RealDictCursor)

cur.execute("SELECT table_name, column_name, data_type FROM information_schema.columns WHERE column_name ILIKE '%farmer%' OR column_name ILIKE '%supplier%';")
rows = cur.fetchall()
import json
print(json.dumps(rows, indent=2, default=str))
cur.close()
conn.close()
