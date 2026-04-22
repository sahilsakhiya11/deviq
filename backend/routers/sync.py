from fastapi import APIRouter, HTTPException, Request

from backend.core.rate_limit import limiter
from backend.ingestion.bm25_indexer import build_confluence_index, build_jira_index
from backend.models.schemas import SyncResponse


router = APIRouter(tags=["sync"])


@router.get("/sync-jira", response_model=SyncResponse)
@limiter.limit("5/minute")
async def sync_jira(request: Request) -> SyncResponse:
    try:
        count = build_jira_index()
        return SyncResponse(status="ok", indexed=count, source="jira")
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Jira sync failed: {exc}")


@router.get("/sync-confluence", response_model=SyncResponse)
@limiter.limit("5/minute")
async def sync_confluence(request: Request) -> SyncResponse:
    try:
        count = build_confluence_index()
        return SyncResponse(status="ok", indexed=count, source="confluence")
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Confluence sync failed: {exc}")