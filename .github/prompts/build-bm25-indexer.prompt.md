---
mode: agent
description: Build the BM25 indexer for DevIQ
***

Generate the complete file `backend/ingestion/bm25_indexer.py`.

Requirements:

Class `BM25Index`:
- `build(documents: list[dict])` — tokenizes with `.lower().split()`, builds BM25Okapi from `title + " " + body`
- `search(query: str, top_k: int = 3) -> list[dict]` — returns top_k docs with id, title, body, source, metadata, score
- `save(path: Path) -> int` — saves `{"documents": [...]}` as JSON, returns document count
- `load(path: Path)` — reads JSON and rebuilds BM25Okapi via `build()`

Standalone functions:
- `build_jira_index() -> int` — loads `mock_jira_data.json`, normalizes to `{id, title, body, source, metadata}`, builds index, saves to `jira_index.json`, returns count
- `build_confluence_index() -> int` — same for confluence data

Normalization for Jira: id=ticket["id"], title=ticket["summary"], body=ticket["description"], source="jira", metadata={status, priority, epic, assignee, sprint, story_points, labels}
Normalization for Confluence: id=page["page_id"], title=page["title"], body=page["body"], source="confluence", metadata={space, labels, author, last_updated}

`if __name__ == "__main__"` calls both build functions and prints counts.
Use `from rank_bm25 import BM25Okapi` and `pathlib.Path` throughout.