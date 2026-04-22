from fastapi import APIRouter, HTTPException, Request

from backend.core.rate_limit import limiter
from backend.models.schemas import TicketExplainRequest, TicketExplainResponse
from backend.services.query_handler import handle_ticket_explain


router = APIRouter(tags=["ticket"])


@router.post("/ticket-explain", response_model=TicketExplainResponse)
@limiter.limit("20/minute")
async def ticket_explain(request: Request, payload: TicketExplainRequest) -> TicketExplainResponse:
    try:
        result = await handle_ticket_explain(payload.ticket_id)
        return TicketExplainResponse(**result)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Ticket explain failed: {exc}")