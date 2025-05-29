#!/bin/bash

# Apply DB migrations
echo "makemigrations started"
python manage.py makemigrations
echo "migrate started"
python manage.py migrate
echo "starting server"
# Start Gunicorn in the background
gunicorn djangoBackend.wsgi:application --bind 0.0.0.0:8000


