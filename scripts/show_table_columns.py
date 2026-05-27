import psycopg2
from psycopg2.extras import RealDictCursor
DB={'host':'localhost','port':5432,'dbname':'agriease_db','user':'postgres','password':'Pass@1234'}
conn=psycopg2.connect(**DB)
cur=conn.cursor(cursor_factory=RealDictCursor)
for t in ['orders','bookings','equipment','users']:
    cur.execute("SELECT column_name,data_type FROM information_schema.columns WHERE table_name=%s ORDER BY ordinal_position",(t,))
    rows=cur.fetchall()
    print('\nTABLE:',t)
    for r in rows:
        print(' ',r['column_name'], r['data_type'])
cur.close();conn.close()
