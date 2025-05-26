#!/bin/bash
#!/bin/sh

python manage.py makemigrations
python manage.py migrate
python gunicorn djangoBackend.wsgi:application --bind 0.0.0.0:8000
