---
mode: agent
description: Build the query handler service for DevIQ
***

Generate the complete file `backend/services/query_handler.py`.

Requirements:

Imports:
- `from backend.ingestion.bm25_indexer import BM25Index`
- `from backend.services.model_router import get_chat_model, get_report_model, run_chat_completion`
- Load dotenv at top of file

Async function `handle_query(question: str, source: str = "both") -> dict`:
- source can be "jira", "confluence", or "both"
- Loads BM25Index fresh from JSON each call (no singleton)
- Searches top_k=3
- If "both": merge jira + confluence results, take top 3 by score
- Builds prompt: system context + retrieved docs (formatted as Source/ID/Title/Content blocks) + question
- Calls `run_chat_completion` with `get_chat_model()`, max_tokens from os.getenv("MAX_TOKENS_CHAT", "6000")
- Returns `{"answer": str, "sources": list[str]}`

Async function `handle_sprint_report(sprint: str) -> dict`:
- Loads jira index, searches top_k=10
- Filters docs where metadata["sprint"] matches sprint name
- Builds detailed report prompt asking for: summary, health (Green/Amber/Red), blockers, metrics
- Calls `run_chat_completion` with `get_report_model()`, max_tokens from os.getenv("MAX_TOKENS_REPORT", "12000")
- Calculates metrics locally: done_count, in_progress_count, todo_count, total_story_points
- Determines health: Green=mostly done, Amber=mixed, Red=mostly blocked
- Returns `{"summary": str, "health": str, "blockers": list[str], "metrics": dict}`

Async function `handle_ticket_explain(ticket_id: str) -> dict`:
- Searches jira index for ticket_id
- Falls back to scanning full documents list if exact match not in top search results
- Raises ValueError if not found
- Calls `run_chat_completion` with `get_chat_model()`
- Returns `{"ticket_id": str, "explanation": str, "plain_english": str}`

System prompt: "You are DevIQ, an AI assistant for engineering teams. Answer using only the provided context."