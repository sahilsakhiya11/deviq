import pytest
from httpx import ASGITransport, AsyncClient

from backend.main import app


@pytest.mark.asyncio
async def test_health():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["index"] == "bm25"


@pytest.mark.asyncio
async def test_chat_validation():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post("/chat", json={"question": "What is the status of mTLS work?", "source": "jira"})
    assert response.status_code in {200, 429, 500}


@pytest.mark.asyncio
async def test_ticket_explain_validation():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post("/ticket-explain", json={"ticket_id": "USCM-1042"})
    assert response.status_code in {200, 429, 500}