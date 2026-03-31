FROM python:3.12-slim

WORKDIR /app

# Install dependencies first — maximises layer cache reuse
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 3000

# Production: no --reload. docker-compose overrides this for dev.
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "3000"]
