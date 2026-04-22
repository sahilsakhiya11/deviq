from typing import Any, Dict, List, Optional

from pydantic import BaseModel


class ChatRequest(BaseModel):
    question: str
    source: Optional[str] = "both"


class ChatResponse(BaseModel):
    answer: str
    sources: List[str]


class TicketExplainRequest(BaseModel):
    ticket_id: str


class TicketExplainResponse(BaseModel):
    ticket_id: str
    explanation: str
    plain_english: str


class SprintReportResponse(BaseModel):
    sprint: str
    summary: str
    health: str
    blockers: List[str]
    metrics: Dict[str, Any]


class SyncResponse(BaseModel):
    status: str
    indexed: int
    source: str