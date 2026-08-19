import sqlite3

try:
    conn = sqlite3.connect('c:/Users/Maeyen/CommunityE-commerce-SPA-Liberia/backend/database.sqlite')
    cursor = conn.cursor()
    
    print("Tables:")
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    print(tables)
    
    for table in tables:
        if 'user' in table[0].lower():
            print(f"\nSchema for {table[0]}:")
            cursor.execute(f"PRAGMA table_info({table[0]})")
            columns = cursor.fetchall()
            for col in columns:
                print(col)
                
    conn.close()
except Exception as e:
    print(e)
