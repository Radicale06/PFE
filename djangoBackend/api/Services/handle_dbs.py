# Services/handle_dbs.py
import sqlite3
import pandas as pd
import pymysql  # MySQL / MariaDB
import pyodbc  # MSSQL / Oracle
import psycopg2  # PostgreSQL / CockroachDB
import cx_Oracle  # Oracle
import firebirdsql  # Firebird
import json
import os
from django.conf import settings

def get_dataframe_from_db(db_type, credentials):
    """Connect to database and fetch data"""
    table_name = credentials.get('table_name')

    try:
        # Get connection based on database type
        conn = get_database_connection(db_type, credentials)
        if conn is None:
            return None

        # Fetch data from database
        return fetch_data_from_db(table_name, conn)

    except Exception as e:
        return None


def get_database_connection(db_type, credentials):
    """Get database connection based on type and credentials"""
    try:
        if db_type == "MySQL":
            return connect_mysql(
                host=credentials.get('host'),
                user=credentials.get('user'),
                password=credentials.get('password'),
                database=credentials.get('database')
            )
        elif db_type == "MariaDB":
            return connect_mariadb(
                host=credentials.get('host'),
                user=credentials.get('user'),
                password=credentials.get('password'),
                database=credentials.get('database')
            )
        elif db_type == "MSSQL":
            return connect_mssql(
                server=credentials.get('server'),
                database=credentials.get('database'),
                username=credentials.get('username'),
                password=credentials.get('password')
            )
        elif db_type == "PostgreSQL":
            return connect_postgresql(
                host=credentials.get('host'),
                user=credentials.get('user'),
                password=credentials.get('password'),
                database=credentials.get('database')
            )
        elif db_type == "CockroachDB":
            return connect_cockroachdb(
                host=credentials.get('host'),
                user=credentials.get('user'),
                password=credentials.get('password'),
                database=credentials.get('database')
            )
        elif db_type == "Oracle":
            return connect_oracle(
                user=credentials.get('user'),
                password=credentials.get('password'),
                dsn=credentials.get('dsn')
            )
        elif db_type == "Firebird":
            return connect_firebird(
                host=credentials.get('host'),
                database=credentials.get('database'),
                user=credentials.get('user'),
                password=credentials.get('password')
            )
        elif db_type == "SQLite":
            return connect_sqlite(db_path=credentials.get('db_path'))
        else:
            return None
    except Exception as e:
        return None

# Connection Functions

def connect_sqlite(db_path):
    try:
        conn = sqlite3.connect(db_path)
        print("Connected to SQLite")
        return conn
    except Exception as e:
        return None


def connect_mysql(host, user, password, database):
    try:
        conn = pymysql.connect(host=host, user=user, password=password, database=database)
        print("Connected to MySQL")
        return conn
    except Exception as e:
        return None


def connect_mariadb(host, user, password, database):
    try:
        conn = pymysql.connect(host=host, user=user, password=password, database=database)
        print("Connected to MariaDB")
        return conn
    except Exception as e:
        return None


def connect_mssql(server, database, username, password):
    try:
        conn = pyodbc.connect(
            f"DRIVER={{SQL Server}};SERVER={server};DATABASE={database};UID={username};PWD={password}"
        )
        print("Connected to MSSQL")
        return conn
    except Exception as e:
        return None


def connect_postgresql(host, user, password, database):
    try:
        conn = psycopg2.connect(host=host, user=user, password=password, database=database)
        print("Connected to PostgreSQL")
        return conn
    except Exception as e:
        return None


def connect_cockroachdb(host, user, password, database):
    try:
        conn = psycopg2.connect(host=host, user=user, password=password, database=database, sslmode="require")
        print("Connected to CockroachDB")
        return conn
    except Exception as e:
        return None


def connect_oracle(user, password, dsn):
    try:
        conn = cx_Oracle.connect(user, password, dsn)
        print("Connected to Oracle")
        return conn
    except Exception as e:
        return None


def connect_firebird(host, database, user, password):
    try:
        conn = firebirdsql.connect(host=host, database=database, user=user, password=password)
        print("Connected to Firebird")
        return conn
    except Exception as e:
        return None


def fetch_data_from_db(table_name, conn):
    """Fetch all rows from a given table name."""
    cursor = None
    try:
        cursor = conn.cursor()
        query = f"SELECT * FROM {table_name}"
        cursor.execute(query)
        rows = cursor.fetchall()
        columns = [desc[0] for desc in cursor.description]
        df = pd.DataFrame(rows, columns=columns)
        return df
    except Exception as e:
        return None
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


def save_dataframe_as_csv(df, chatbot, db_type, table_name):
    """Save DataFrame as CSV file in chatbot-specific directory"""
    try:
        # Create filename with database info
        filename = f"{db_type.lower()}_{table_name}_{pd.Timestamp.now().strftime('%Y%m%d_%H%M%S')}.csv"

        # Create chatbot-specific directory path
        chatbot_dir = os.path.join(settings.MEDIA_ROOT, 'chatbots', str(chatbot.id))
        os.makedirs(chatbot_dir, exist_ok=True)

        # Full file path
        file_path = os.path.join(chatbot_dir, filename)

        # Save DataFrame to CSV
        df.to_csv(file_path, index=False)

        # Return relative path for storage in database
        relative_path = os.path.join('chatbots', str(chatbot.id), filename)
        return relative_path

    except Exception as e:
        raise e