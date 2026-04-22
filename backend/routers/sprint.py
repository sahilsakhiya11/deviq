from fastapi import APIRouter, HTTPException, Query, Request

from backend.core.rate_limit import limiter
from backend.models.schemas import SprintReportResponse
from backend.services.query_handler import handle_sprint_report


router = APIRouter(tags=["sprint"])


@router.get("/sprint-report", response_model=SprintReportResponse)
@limiter.limit("10/minute")
async def sprint_report(request: Request, sprint: str = Query(...)) -> SprintReportResponse:
    try:
        result = await handle_sprint_report(sprint)
        return SprintReportResponse(sprint=sprint, **result)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Sprint report failed: {exc}")