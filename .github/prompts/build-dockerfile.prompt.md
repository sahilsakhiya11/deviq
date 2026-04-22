---
mode: agent
description: Create Docker and environment setup for DevIQ
***

Generate these complete files:

**`requirements.txt`**
fastapi, uvicorn[standard], openai, rank-bm25, python-dotenv, pydantic, requests, urllib3, slowapi

**`.env.example`**
```
OPENAI_API_KEY=your-openai-key-here
OPENAI_MODEL_CHAT=gpt-4.1-mini
OPENAI_MODEL_REPORT=gpt-4.1
MAX_TOKENS_CHAT=6000
MAX_TOKENS_REPORT=12000
```

**`Dockerfile`**
- Base: python:3.11-slim
- WORKDIR /app
- Copy and install requirements.txt first (cache layer)
- Copy backend/
- Run ingestion scripts to pre-build indexes: mock_jira.py, mock_confluence.py, bm25_indexer.py
- EXPOSE 8000
- CMD: uvicorn backend.main:app --host 0.0.0.0 --port 8000

**`docker-compose.yml`**
- Service: deviq-api
- build: .
- ports: 8000:8000
- env_file: .env
- volumes: ./backend/ingestion:/app/backend/ingestion

**`backend/deviq.http`** (REST Client test file)
Include test requests for: GET /health, POST /chat (jira), POST /chat (confluence), GET /sprint-report?sprint=Sprint 24, POST /ticket-explain with USCM-1042, GET /sync-jira, GET /sync-confluence