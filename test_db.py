from sqlalchemy import create_engine, MetaData

# Connect to your database
engine = create_engine("postgresql://postgres.dzyhrlombjyzieipgmiz:x8ynhukdaqnehY4Q@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres")

# Reflect the database
metadata = MetaData()
metadata.reflect(bind=engine)

# Print tables and columns
for table_name, table in metadata.tables.items():
    print(f"Table: {table_name}")
    for column in table.columns:
        print(f"  {column.name} -> {column.type}")