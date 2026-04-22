from fastapi import APIRouter, HTTPException, Request

from backend.core.rate_limit import limiter
from backend.models.schemas import ChatRequest, ChatResponse
from backend.services.query_handler import handle_query


router = APIRouter(tags=["chat"])


@router.post("/chat", response_model=ChatResponse)
@limiter.limit("20/minute")
async def chat(request: Request, payload: ChatRequest) -> ChatResponse:
    try:
        result = await handle_query(payload.question, payload.source or "both")
        return ChatResponse(**result)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Chat failed: {exc}")