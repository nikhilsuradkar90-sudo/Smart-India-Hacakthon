import sqlite3

path = '/Users/gauravkumar/Downloads/Nikhil Project SIH/server/prisma/dev.db'
conn = sqlite3.connect(path)
c = conn.cursor()

def get_count(table):
    try:
        c.execute(f"SELECT count(*) FROM {table}")
        return c.fetchone()[0]
    except Exception as e:
        return str(e)

print("Standards:", get_count("Standard"))
print("Products:", get_count("Product"))
print("Certifications:", get_count("CertificationScheme"))
print("Laboratories:", get_count("Laboratory"))
print("Chunks:", get_count("DocumentChunk"))
