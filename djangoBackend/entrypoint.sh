#!/bin/bash

# Apply DB migrations
echo "Waiting for postgres..."
while ! nc -z postgres-db 5432; do
  sleep 0.5
done
echo "Waiting for chroma..."
while ! nc -z chroma 8000; do
  sleep 0.5
done
echo "chroma started"

echo "PostgreSQL started"
echo "makemigrations started"
python manage.py makemigrations
echo "migrate started"
python manage.py migrate
echo "starting server"
# Start Gunicorn in the background
gunicorn djangoBackend.wsgi:application --bind 0.0.0.0:8000 &

sleep 1

celery -A djangoBackend worker  --autoscale=8,4 --loglevel=INFO