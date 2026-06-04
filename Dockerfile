FROM python:3.11-slim

WORKDIR /app

ENV PYTHONUNBUFFERED=1

# System dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy app and static files
COPY app/ ./app/
COPY asgi.py .

# Port
EXPOSE 8000

# Start with dynamic PORT for Railway
CMD uvicorn asgi:app --host 0.0.0.0 --port ${PORT:-8000}
