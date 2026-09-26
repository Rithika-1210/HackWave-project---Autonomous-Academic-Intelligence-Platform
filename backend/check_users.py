import sqlite3

for db_path in ['aaip.db', '../aaip.db']:
    try:
        conn = sqlite3.connect(db_path)
        cur = conn.cursor()
        print(f"=== DB: {db_path} ===")
        cur.execute("SELECT id, email, full_name, role, approval_status FROM users")
        rows = cur.fetchall()
        for r in rows:
            print(r)
        conn.close()
    except Exception as e:
        print(f"Error {db_path}: {e}")
