import sqlite3
import pandas as pd
import pymysql  # MySQL
import mariadb  # MariaDB
import pyodbc  # MSSQL, Oracle
import psycopg2  # PostgreSQL
import cockroachdb  # CockroachDB
import cx_Oracle  # Oracle
import firebirdsql  # Firebird

def connect_sqlite(db_path):
    """Connect to SQLite database."""
    try:
        conn = sqlite3.connect(db_path)
        print("Connected to SQLite")
        return conn
    except Exception as e:
        print(f"SQLite Connection Error: {e}")
        return None

def connect_mysql(host, user, password, database):
    """Connect to MySQL database."""
    try:
        conn = pymysql.connect(host=host, user=user, password=password, database=database)
        print("Connected to MySQL")
        return conn
    except Exception as e:
        print(f"MySQL Connection Error: {e}")
        return None

def connect_mariadb(host, user, password, database):
    """Connect to MariaDB database."""
    try:
        conn = mariadb.connect(host=host, user=user, password=password, database=database)
        print("Connected to MariaDB")
        return conn
    except Exception as e:
        print(f"MariaDB Connection Error: {e}")
        return None

def connect_mssql(server, database, username, password):
    """Connect to Microsoft SQL Server."""
    try:
        conn = pyodbc.connect(f"DRIVER={{SQL Server}};SERVER={server};DATABASE={database};UID={username};PWD={password}")
        print("Connected to MSSQL")
        return conn
    except Exception as e:
        print(f"MSSQL Connection Error: {e}")
        return None

def connect_postgresql(host, user, password, database):
    """Connect to PostgreSQL database."""
    try:
        conn = psycopg2.connect(host=host, user=user, password=password, database=database)
        print("Connected to PostgreSQL")
        return conn
    except Exception as e:
        print(f"PostgreSQL Connection Error: {e}")
        return None

def connect_cockroachdb(host, user, password, database):
    """Connect to CockroachDB."""
    try:
        conn = psycopg2.connect(host=host, user=user, password=password, database=database, sslmode="require")
        print("Connected to CockroachDB")
        return conn
    except Exception as e:
        print(f"CockroachDB Connection Error: {e}")
        return None

def connect_oracle(user, password, dsn):
    """Connect to Oracle database."""
    try:
        conn = cx_Oracle.connect(user, password, dsn)
        print("Connected to Oracle")
        return conn
    except Exception as e:
        print(f"Oracle Connection Error: {e}")
        return None

def connect_firebird(host, database, user, password):
    """Connect to Firebird database."""
    try:
        conn = firebirdsql.connect(host=host, database=database, user=user, password=password)
        print("Connected to Firebird")
        return conn
    except Exception as e:
        print(f"Firebird Connection Error: {e}")
        return None

def fetch_data_from_db(query, conn):
    """Execute a query and return fetched results."""
    try:
        cursor = conn.cursor()
        cursor.execute(query)
        rows = cursor.fetchall()
        columns = [desc[0] for desc in cursor.description]
        df = pd.DataFrame(rows, columns=columns)
        return df
    except Exception as e:
        print(f"Error executing query: {e}")
        return None
    finally:
        cursor.close()

# Example usage (Replace credentials with real ones)
def get_DataFrameFrom_DBs(db_name, host, user, password, database, querry):
    connections = {
        "MySQL": connect_mysql(host, user, password, database),
        "MariaDB": connect_mariadb(host, user, password, database),
        "MSSQL": connect_mssql(host, database, user, password),
        "PostgreSQL": connect_postgresql(host, user, password, database),
        "CockroachDB": connect_cockroachdb(host, user, password, database),
        "Oracle": connect_oracle(user, password, dsn=database),
        "Firebird": connect_firebird(host, database, user, password),
    }
    connection = connections[db_name]
    df= fetch_data_from_db(querry, connection)
    return df



