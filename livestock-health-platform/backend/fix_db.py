import sqlite3
import sys

conn = sqlite3.connect('livestock_phase1.db')
cursor = conn.cursor()

cursor.execute("UPDATE users SET password_hash = 'farmer123' WHERE username = 'farmer.demo'")
cursor.execute("UPDATE users SET password_hash = 'vet123' WHERE username = 'vet.demo'")
cursor.execute("UPDATE users SET password_hash = 'gov123' WHERE username = 'gov.demo'")

conn.commit()
conn.close()
print("Updated passwords for demo accounts")
