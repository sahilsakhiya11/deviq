FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1
WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

COPY backend ./backend
COPY .env.example ./.env.example

RUN python backend/ingestion/mock_jira.py && \
    python backend/ingestion/mock_confluence.py && \
    python backend/ingestion/bm25_indexer.py

EXPOSE 8000

CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]