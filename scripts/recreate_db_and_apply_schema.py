import subprocess, sys, os

try:
    import psycopg2
except ImportError:
    print('psycopg2 not installed, installing psycopg2-binary...')
    subprocess.check_call([sys.executable, '-m', 'pip', 'install', 'psycopg2-binary'])
    import psycopg2

from psycopg2.extras import RealDictCursor

DB_ADMIN = {
    'host': 'localhost',
    'port': 5432,
    'dbname': 'postgres',
    'user': 'postgres',
    'password': 'Pass@1234'
}

TARGET_DB = 'agriease_db'
SCHEMA_FILE = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'schema.sql'))

print('Using schema file:', SCHEMA_FILE)

# Connect to postgres to drop/create DB
conn = psycopg2.connect(**DB_ADMIN)
conn.autocommit = True
cur = conn.cursor()

# Terminate active connections to target DB
print('Terminating active connections to', TARGET_DB)
cur.execute("SELECT pid FROM pg_stat_activity WHERE datname=%s AND pid <> pg_backend_pid()", (TARGET_DB,))
rows = cur.fetchall()
for (pid,) in rows:
    try:
        print('Terminating pid', pid)
        cur.execute("SELECT pg_terminate_backend(%s)", (pid,))
    except Exception as e:
        print('Could not terminate', pid, e)

# Drop database
print('Dropping database if exists')
cur.execute(f"DROP DATABASE IF EXISTS {TARGET_DB}")
print('Creating database')
cur.execute(f"CREATE DATABASE {TARGET_DB}")
cur.close()
conn.close()

# Apply schema
print('Applying schema to', TARGET_DB)
DB_TARGET = DB_ADMIN.copy()
DB_TARGET['dbname'] = TARGET_DB
conn2 = psycopg2.connect(**DB_TARGET)
cur2 = conn2.cursor()

with open(SCHEMA_FILE, 'r', encoding='utf-8') as f:
    sql = f.read()

# Execute the schema SQL
try:
    cur2.execute(sql)
    conn2.commit()
    print('Schema applied successfully')
except Exception as e:
    print('Error applying schema:', e)
    conn2.rollback()
finally:
    cur2.close()
    conn2.close()

print('Done')
