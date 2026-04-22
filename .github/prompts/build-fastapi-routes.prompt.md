---
mode: agent
description: Build FastAPI main app and all routes for DevIQ
***

Generate these complete files:

**`backend/models/schemas.py`**
Pydantic models:
- `ChatRequest`: question: str, source: Optional[str] = "both"
- `ChatResponse`: answer: str, sources: List[str]
- `TicketExplainRequest`: ticket_id: str
- `TicketExplainResponse`: ticket_id: str, explanation: str, plain_english: str
- `SprintReportResponse`: sprint: str, summary: str, health: str, blockers: List[str], metrics: Dict[str, Any]
- `SyncResponse`: status: str, indexed: int, source: str

**`backend/routers/chat.py`**
- POST /chat → calls handle_query() → returns ChatResponse
- HTTPException 400 for ValueError, 500 for all others

**`backend/routers/sprint.py`**
- GET /sprint-report?sprint=Sprint+24 → calls handle_sprint_report() → returns SprintReportResponse

**`backend/routers/ticket.py`**
- POST /ticket-explain → calls handle_ticket_explain() → returns TicketExplainResponse
- HTTPException 404 for ValueError

**`backend/routers/sync.py`**
- GET /sync-jira → calls build_jira_index() → returns SyncResponse
- GET /sync-confluence → calls build_confluence_index() → returns SyncResponse

**`backend/main.py`**
- FastAPI app: title="DevIQ API", version="1.0.0"
- CORSMiddleware: allow_origins=["*"]
- Register all 4 routers
- GET /health returns {"status": "ok", "version": "1.0.0", "index": "bm25"}
- load_dotenv() at startup

**All `__init__.py` files** for backend/, routers/, services/, ingestion/, models/ — empty files only.