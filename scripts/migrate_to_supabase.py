import sys
from pathlib import Path
from typing import List
import psycopg2
from psycopg2 import sql, extras

LOCAL_DB = {
    "host": "localhost",
    "port": 5432,
    "dbname": "agriease_db",
    "user": "postgres",
    "password": "Pass@1234",
}

SUPABASE_DB = {
    "host": "db.qyqcjqfapdyhkjmrlgbs.supabase.co",
    "port": 5432,
    "dbname": "postgres",
    "user": "postgres",
    "password": "Agriease@1234",
    "sslmode": "require",
}

TABLE_ORDER = [
    "users",
    "equipment",
    "products",
    "bookings",
    "orders",
    "order_items",
    "plant_disease_reports",
]

SCHEMA_FILE = Path(__file__).resolve().parents[1] / "schema.sql"


def load_schema(target_conn):
    if not SCHEMA_FILE.exists():
        print(f"Schema file not found: {SCHEMA_FILE}")
        return
    schema_sql = SCHEMA_FILE.read_text(encoding="utf-8")
    with target_conn.cursor() as cur:
        print("Applying schema to Supabase...")
        cur.execute(schema_sql)
    target_conn.commit()


def get_columns(conn, table: str) -> List[str]:
    with conn.cursor() as cur:
        cur.execute(
            """
            SELECT column_name
            FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = %s
            ORDER BY ordinal_position
            """,
            (table,),
        )
        return [row[0] for row in cur.fetchall()]


def truncate_table(conn, table: str):
    with conn.cursor() as cur:
        cur.execute(
            sql.SQL("TRUNCATE TABLE {} RESTART IDENTITY CASCADE")
            .format(sql.Identifier(table))
        )
    conn.commit()


def reset_sequences(conn, table: str):
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT pg_get_serial_sequence(%s, 'id')", (table,))
            row = cur.fetchone()
            if not row or row[0] is None:
                return
            sequence_name = row[0]
            cur.execute(
                sql.SQL(
                    "SELECT setval(%s, COALESCE((SELECT MAX(id) FROM {}), 0) + 1, false)"
                ).format(sql.Identifier(table)),
                (sequence_name,),
            )
        conn.commit()
    except Exception as exc:  # pragma: no cover - best effort
        conn.rollback()
        print(f"Could not reset sequence for {table}: {exc}")


def copy_table(source_conn, target_conn, table: str):
    columns = get_columns(source_conn, table)
    if not columns:
        print(f"Skipping table '{table}' (no columns found)")
        return

    print(f"Copying table '{table}'...")
    with source_conn.cursor() as src_cur:
        src_cur.execute(
            sql.SQL("SELECT {} FROM {} ORDER BY 1")
            .format(
                sql.SQL(', ').join(map(sql.Identifier, columns)),
                sql.Identifier(table),
            )
        )
        rows = src_cur.fetchall()

    truncate_table(target_conn, table)

    if not rows:
        print(f"  No rows to copy for '{table}'")
        return

    insert_stmt = sql.SQL("INSERT INTO {} ({}) VALUES ({})").format(
        sql.Identifier(table),
        sql.SQL(', ').join(map(sql.Identifier, columns)),
        sql.SQL(', ').join(sql.Placeholder() for _ in columns),
    )

    with target_conn.cursor() as dst_cur:
        extras.execute_batch(dst_cur, insert_stmt, rows, page_size=200)
    target_conn.commit()
    reset_sequences(target_conn, table)
    print(f"  Copied {len(rows)} rows into '{table}'")


def main():
    print("Connecting to local PostgreSQL...")
    try:
        local_conn = psycopg2.connect(**LOCAL_DB)
    except Exception as exc:
        print("Failed to connect to local database:", exc)
        sys.exit(1)

    print("Connecting to Supabase PostgreSQL...")
    try:
        supabase_conn = psycopg2.connect(**SUPABASE_DB)
    except Exception as exc:
        print("Failed to connect to Supabase:", exc)
        local_conn.close()
        sys.exit(1)

    try:
        load_schema(supabase_conn)
        with supabase_conn.cursor() as cur:
            cur.execute("SET session_replication_role = 'replica';")
        supabase_conn.commit()

        for table in TABLE_ORDER:
            copy_table(local_conn, supabase_conn, table)

        with supabase_conn.cursor() as cur:
            cur.execute("SET session_replication_role = 'origin';")
        supabase_conn.commit()
        print("Migration completed successfully! 🎉")
    finally:
        local_conn.close()
        supabase_conn.close()


if __name__ == "__main__":
    main()
