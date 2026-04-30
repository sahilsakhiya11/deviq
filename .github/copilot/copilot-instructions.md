DevIQ — GitHub Copilot Custom Instructions
Project Identity
You are assisting with DevIQ, an AI-powered Engineering Intelligence Platform.

Backend: FastAPI + Python 3.11

RAG: BM25 via rank-bm25 (NO vector embeddings, NO Pinecone, NO FAISS)

LLM: OpenAI API — gpt-4.1-mini for chat/queries, gpt-4.1 for sprint reports/summaries

Data: Mock Jira + Mock Confluence JSON files (no live APIs on personal laptop)

Deploy: Docker → Railway or Render

Coding Rules (Always Follow)
All files must be complete — never produce snippets or partial code

Always use python-dotenv and load from .env — never hardcode API keys

Always add verify=False + suppress SSL warnings with urllib3.disable_warnings() on any requests call

Keep code concise and production-ready — minimal comments, no over-engineering

All FastAPI routes must include proper Pydantic request/response models

Always include proper error handling with HTTPException

Use async def for all FastAPI route handlers

BM25 index files are stored as JSON at backend/ingestion/jira_index.json and backend/ingestion/confluence_index.json

Project File Structure
text
deviq/
├── backend/
│   ├── main.py
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── chat.py
│   │   ├── sprint.py
│   │   ├── ticket.py
│   │   └── sync.py
│   ├── services/
│   │   ├── __init__.py
│   │   ├── query_handler.py
│   │   └── model_router.py
│   ├── ingestion/
│   │   ├── __init__.py
│   │   ├── mock_jira.py
│   │   ├── mock_confluence.py
│   │   ├── bm25_indexer.py
│   │   ├── mock_jira_data.json        ← generated at runtime
│   │   ├── mock_confluence_data.json  ← generated at runtime
│   │   ├── jira_index.json            ← generated at runtime
│   │   └── confluence_index.json      ← generated at runtime
│   └── models/
│       ├── __init__.py
│       └── schemas.py
├── frontend/
├── requirements.txt
├── Dockerfile
├── docker-compose.yml
├── .env
└── .env.example
Mock Jira Ticket Schema
json
{
  "id": "JIRA-1042",
  "summary": "Enable mTLS for Global Platform services",
  "description": "Full description...",
  "status": "In Progress",
  "priority": "High",
  "epic": "Global Platform Readiness",
  "assignee": "john.smith@bank.com",
  "sprint": "Sprint 24",
  "story_points": 5,
  "labels": ["security", "platform", "mtls"],
  "created": "2026-03-15",
  "updated": "2026-04-10"
}
Mock Confluence Page Schema
json
{
  "page_id": "CONF-201",
  "title": "Global Platform Readiness Runbook",
  "space": "Engineering",
  "body": "Full page content...",
  "labels": ["runbook", "platform"],
  "author": "jane.doe@bank.com",
  "last_updated": "2026-04-01"
}
OpenAI Rules
Chat / ticket-explain → gpt-4.1-mini, temperature=0.3, max_tokens from .env

Sprint report / summaries → gpt-4.1, temperature=0.3

Always include a system prompt establishing DevIQ context

Never hardcode model names — always read from os.getenv()

BM25 Rules
Tokenize with .lower().split()

Combined index text = title + " " + body

Return top_k=3 for chat, top_k=5 for reports

Each doc in index: {id, title, body, source, metadata}

Always load index fresh from JSON — no in-memory singleton