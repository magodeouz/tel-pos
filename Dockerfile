FROM python:3.11-slim

WORKDIR /app

# System dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements dan install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy app
COPY app/ ./app/
COPY asgi.py .

# Port
EXPOSE 8000

# Start server
CMD ["uvicorn", "asgi:app", "--host", "0.0.0.0", "--port", "8000"]
