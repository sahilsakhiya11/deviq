import json
import os
from pathlib import Path

from dotenv import load_dotenv

from backend.ingestion.bm25_indexer import BM25Index
from backend.services.model_router import (
    get_chat_model,
    get_report_model,
    run_chat_completion,
)


load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent
INGESTION_DIR = BASE_DIR / "ingestion"
JIRA_INDEX_PATH = INGESTION_DIR / "jira_index.json"
CONFLUENCE_INDEX_PATH = INGESTION_DIR / "confluence_index.json"


SYSTEM_PROMPT = """You are DevIQ, an AI assistant for engineering teams.
You answer questions using retrieved Jira and Confluence context.
Be concise, practical, and clear.
If the answer is not supported by the provided context, say that clearly.
"""


def _load_index(path: Path) -> BM25Index:
    index = BM25Index()
    index.load(path)
    return index


def _merge_results(*result_sets: list[dict], top_k: int = 3) -> list[dict]:
    combined = []
    for result_set in result_sets:
        combined.extend(result_set)
    combined.sort(key=lambda x: x["score"], reverse=True)
    return combined[:top_k]


def _format_context(docs: list[dict]) -> str:
    chunks = []
    for doc in docs:
        chunks.append(
            f"""Source: {doc['source']}
ID: {doc['id']}
Title: {doc['title']}
Metadata: {json.dumps(doc['metadata'])}
Content: {doc['body']}"""
        )
    return "\n\n---\n\n".join(chunks)


async def handle_query(question: str, source: str = "both") -> dict:
    source = source.lower().strip()

    if source not in {"jira", "confluence", "both"}:
        raise ValueError("source must be one of: jira, confluence, both")

    if source == "jira":
        docs = _load_index(JIRA_INDEX_PATH).search(question, top_k=3)
    elif source == "confluence":
        docs = _load_index(CONFLUENCE_INDEX_PATH).search(question, top_k=3)
    else:
        jira_docs = _load_index(JIRA_INDEX_PATH).search(question, top_k=3)
        confluence_docs = _load_index(CONFLUENCE_INDEX_PATH).search(question, top_k=3)
        docs = _merge_results(jira_docs, confluence_docs, top_k=3)

    context = _format_context(docs)
    user_prompt = f"""Answer the question using only the context below.

Context:
{context}

Question:
{question}
"""

    answer = await run_chat_completion(
        system_prompt=SYSTEM_PROMPT,
        user_prompt=user_prompt,
        model=get_chat_model(),
        max_tokens=int(os.getenv("MAX_TOKENS_CHAT", "6000")),
    )

    return {
        "answer": answer,
        "sources": [doc["id"] for doc in docs],
    }


async def handle_sprint_report(sprint: str) -> dict:
    index = _load_index(JIRA_INDEX_PATH)
    docs = index.search(sprint, top_k=10)

    sprint_docs = [
        doc for doc in docs
        if doc["metadata"].get("sprint", "").lower() == sprint.lower()
    ]

    if not sprint_docs:
        sprint_docs = docs[:5]

    context = _format_context(sprint_docs)
    prompt = f"""You are preparing a sprint health report for leadership.

Using only the Jira context below, produce:
1. A short sprint summary
2. Overall health: Green, Amber, or Red
3. A list of blockers or risks
4. Basic metrics as JSON-like values for:
   done_count, in_progress_count, todo_count, total_story_points

Context:
{context}

Sprint:
{sprint}
"""

    raw = await run_chat_completion(
        system_prompt=SYSTEM_PROMPT,
        user_prompt=prompt,
        model=get_report_model(),
        max_tokens=int(os.getenv("MAX_TOKENS_REPORT", "12000")),
    )

    statuses = [doc["metadata"].get("status", "") for doc in sprint_docs]
    done_count = sum(1 for s in statuses if s == "Done")
    in_progress_count = sum(1 for s in statuses if s == "In Progress")
    todo_count = sum(1 for s in statuses if s in {"To Do", "In Review"})
    total_story_points = sum(int(doc["metadata"].get("story_points", 0)) for doc in sprint_docs)

    health = "Green"
    if todo_count >= done_count:
        health = "Amber"
    if in_progress_count >= 4 and done_count == 0:
        health = "Red"

    blockers = []
    for doc in sprint_docs:
        if doc["metadata"].get("status") in {"To Do", "In Progress", "In Review"} and doc["metadata"].get("priority") == "High":
            blockers.append(f"{doc['id']} - {doc['title']}")

    return {
        "summary": raw,
        "health": health,
        "blockers": blockers[:5],
        "metrics": {
            "done_count": done_count,
            "in_progress_count": in_progress_count,
            "todo_count": todo_count,
            "total_story_points": total_story_points,
        },
    }


async def handle_ticket_explain(ticket_id: str) -> dict:
    index = _load_index(JIRA_INDEX_PATH)
    docs = index.search(ticket_id, top_k=10)

    exact = next((doc for doc in docs if doc["id"].lower() == ticket_id.lower()), None)
    if not exact:
        jira_payload = json.loads(JIRA_INDEX_PATH.read_text(encoding="utf-8"))
        exact = next(
            (doc for doc in jira_payload["documents"] if doc["id"].lower() == ticket_id.lower()),
            None
        )

    if not exact:
        raise ValueError(f"Ticket not found: {ticket_id}")

    context = _format_context([exact])
    prompt = f"""Explain this Jira ticket in plain English for a new engineer.
Keep it simple and practical.
Also explain why it matters.

Context:
{context}
"""

    answer = await run_chat_completion(
        system_prompt=SYSTEM_PROMPT,
        user_prompt=prompt,
        model=get_chat_model(),
        max_tokens=int(os.getenv("MAX_TOKENS_CHAT", "6000")),
    )

    return {
        "ticket_id": exact["id"],
        "explanation": answer,
        "plain_english": answer,
    }