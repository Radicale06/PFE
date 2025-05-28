FROM python:3.11-slim
# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        postgresql-client \
        build-essential \
        libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Copy project
COPY . /app/


# Create entrypoint script
RUN echo '#!/bin/bash\n\
set -e\n\
echo "Waiting for postgres..."\n\
while ! nc -z $POSTGRES_HOST $POSTGRES_PORT; do\n\
  sleep 0.1\n\
done\n\
echo "PostgreSQL started"\n\
python manage.py makemigrations\n\
python manage.py migrate\n\
python manage.py runserver 0.0.0.0:8000' > /app/entrypoint.sh

RUN chmod +x /app/entrypoint.sh

EXPOSE 8000

ENTRYPOINT ["/app/entrypoint.sh"]