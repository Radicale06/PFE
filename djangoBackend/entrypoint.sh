#!/bin/bash

echo "Waiting for PostgreSQL..."
while ! nc -z "$POSTGRES_HOST" "$POSTGRES_PORT"; do
  sleep 1
done
echo "PostgreSQL is up."

echo "Waiting for Redis..."
while ! nc -z redis 6379; do
  sleep 1
done
echo "Redis is up."

echo "Waiting for Chroma on port 5000..."
while ! nc -z chroma 5000; do
  sleep 1
done
echo "ChromaDB is up."

echo "Applying Django migrations..."
python manage.py migrate

echo "Starting Gunicorn server..."
exec gunicorn djangoBackend.wsgi:application --bind 0.0.0.0:8000
